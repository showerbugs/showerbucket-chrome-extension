/**
 * @ngdoc overview
 * @name doorayWebApp.log
 * @description
 * # doorayWebApp.log
 *
 * Config module of the application.
 */

(function () {

    'use strict';

    angular
        .module('doorayWebApp.log')
        .constant('ANALYTICS_CATEGORYS', {
            TIME_TO_FULL_LOAD: 'full load',
            TIME_TO_DIGEST_LOAD: '$digest load',
            ERROR_XHR: 'xhr error',
            ERROR_JAVASCRIPT: 'javascript error'
        })
        .config(configLogProvider)
        .config(configHttpProvider)
        .config(configAnalyticsProvider)
        .factory('$exceptionHandler', exceptionHandlerForAnalytics)
        .run(runInitializeAnalyticsLoadTiming)
        .run(runInitializeTrackSlowDigestTiming);

    function getGaDomainName() {
        return window.location.host.indexOf('local.dooray.com') >= 0 ? 'none' : window.location.host;
    }

    /* @ngInject */
    function configLogProvider($logProvider) {
        $logProvider.debugEnabled(getGaDomainName() === 'none');
    }

    /* @ngInject */
    function configHttpProvider($httpProvider) {
        //서비스 오류발생에 대한 Analytick 전송 처리
        $httpProvider.interceptors.push(interceptHttpResponseError);
    }

    /* @ngInject */
    function configAnalyticsProvider(AnalyticsProvider) {
        // Add configuration code as desired - see below
        AnalyticsProvider
            .setAccount({
                tracker: /(?:local|dev|alpha|beta|real|stage)\.dooray\.com/.test(window.location.host) ? 'UA-73215665-3' : 'UA-73215665-1',
                fields: {
                    cookieDomain: getGaDomainName()
                },
                set: {
                    forceSSL: true
                    //uid: '1234567890'
                },
                trackEvent: true
            })
            .setPageEvent('$stateChangeSuccess')
            .ignoreFirstPageLoad(true) //detected at google-analytics in log.jsp
            .disableAnalytics(getGaDomainName() === 'none') //disable ga send when local env
            .trackPages(true)
            .trackUrlParams(true);
            //.trackPrefix(window.location.origin)
            //.readFromRoute(false)
            //.enterDebugMode(true)
            //.setDomainName(getGaDomainName()) // for Classic Analytics ga.js
            //.useDisplayFeatures(true);
    }

    /* @ngInject */
    function exceptionHandlerForAnalytics($injector, $log) {
        //override for ga tracking error log
        //http://stackoverflow.com/questions/16192464/window-onerror-not-working-in-chrome
        return function (exception) {
            var args = arguments;
            return $injector.invoke(['$location', 'Analytics', 'ANALYTICS_CATEGORYS', function ($location, Analytics, ANALYTICS_CATEGORYS) {
                $log.error.apply($log, args);  //angular.js#L10344 function $ExceptionHandlerProvider() { ...
                Analytics.trackEvent(ANALYTICS_CATEGORYS.ERROR_JAVASCRIPT, 'detect', JSON.stringify({
                    absUrl: $location.absUrl(),
                    stack: exception.stack
                }, null, 4), 0, true);
            }]);
        };
    }

    /* @ngInject */
    function interceptHttpResponseError($log, $q, Analytics, ANALYTICS_CATEGORYS) {
        //XHR API 요청에 대한 에러 발생시 google Anaytics에 전송
        return {
            responseError: function (errorResponse) {
                //errorResponse.status === -1 : 동일 요청 Request cancel 처리됨
                if (errorResponse.status !== -1) {
                    $log.debug('interceptHttpResponseError');
                    Analytics.trackEvent(ANALYTICS_CATEGORYS.ERROR_XHR, 'detect', JSON.stringify({
                        url: errorResponse.config.url,
                        status: errorResponse.status,
                        method: errorResponse.config.method
                    }, null, 4), 0, true);
                }
                return $q.reject(errorResponse);
            }
        };
    }

    /* @ngInject */
    function runInitializeAnalyticsLoadTiming($location, $log, $rootScope, $window, Analytics, ANALYTICS_CATEGORYS) {
        var handler = $rootScope.$on('$stateChangeSuccess', function () {
            handler();
            //각 페이지 최 상단에 위치하고 값이 있으면 타이밍 로그 추가
            if ($window.GA_FIRST_LOAD_TIMESTAMP) {
                var takes = Date.now() - $window.GA_FIRST_LOAD_TIMESTAMP;
                $log.debug('runInitializeAnalyticsLoadTiming: ', takes + '(ms)');
                Analytics.trackTimings(ANALYTICS_CATEGORYS.TIME_TO_FULL_LOAD, '$stateChangeSuccess(ms)', takes, $location.absUrl());
            }
        });
    }

    /* @ngInject */
    function runInitializeTrackSlowDigestTiming($location, $log, $rootScope, Analytics, ANALYTICS_CATEGORYS) {
        var SLOW_DIGEST_THRESOLD_MS = 1000;
        var $oldDigest = $rootScope.$digest;

        var $trackDigest = function () {
            var started = Date.now();
            $oldDigest.apply($rootScope);
            var takes = Date.now() - started;
            if (takes > SLOW_DIGEST_THRESOLD_MS) {
                $log.debug('runTrackSlowDigestTiming:', takes + '(ms)');
                Analytics.trackTimings(ANALYTICS_CATEGORYS.TIME_TO_DIGEST_LOAD, 'execute $digest(ms)', takes, $location.absUrl());
                //Analytics.trackEvent(ANALYTICS_CATEGORYS.TIME_TO_DIGEST_LOAD, 'execute $digest(ms)', $location.absUrl(), takes, true);
            }
        };
        $rootScope.$digest = $trackDigest;
    }

})();
