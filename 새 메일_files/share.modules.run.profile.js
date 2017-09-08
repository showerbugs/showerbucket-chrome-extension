(function () {

    'use strict';

    angular.module('doorayWebApp.share')
        .run(runInitializeProfile);

    /* @ngInject */
    function runInitializeProfile($location, $rootScope, $window, $log) {
        //angular 성능측정 용 $digest이며 URL 파라미터에 _digest=true[&_profile=true] 가 있을 시 로 자동 실행
        if ($location.search()['_digest'] !== 'true') {
            return;
        }

        $log.info('start measure of $ditest time and count and show 100ms over. !!!');
        $window._debug = {};
        $window._debug.profile = ($location.search()['_profile'] === 'true');
        $window._debug.threshold = $location.search()['_threshold'] || 100;
        $window._debug.digestList = [];
        $window._debug.showTable = function () {
            console.table && console.table($window._debug.digestList);
        };
        $window._debug.copyClipboard = function () {
            copy && copy($window._debug.digestList);
        };

        var performance = $window.performance;
        if (!performance) {
            return;
        }

        // taken from http://ng.malsup.com/#!/counting-watchers
        function countAngularWatchers() {
            var i, data, scope,
                count = 0,
                watchers = [],
                all$ = angular.element('*'),
                len = all$.length,
                test = {};

            // go through each element. Count watchers if it has scope or isolate scope
            /* eslint no-for-loops:0 */
            for (i = 0; i < len; i++) {
                /* global angular */
                data = all$.eq(i).data();
                scope = data.$scope || data.$isolateScope;
                if (scope && scope.$$watchers) {
                    if (!test[scope.$id]) {
                        test[scope.$id] = true;
                        count += scope.$$watchers.length;
                        watchers = watchers.concat(scope.$$watchers);
                    }
                }
            }
            return count;
        }

        var accuredTime = 0, uuid = 0;
        var $oldDigest = $rootScope.$digest;
        var $newDigest = function () {
            uuid++;
            if ($window._debug.profile) {
                console.profile('$digest' + uuid);
            }
            var started = performance.now();
            $oldDigest.apply($rootScope);
            var takes = performance.now() - started;

            accuredTime += takes;
            if ($window._debug.profile) {
                $log.info('$digest' + uuid + ' accrueTime=' + accuredTime + 'ms', ', execTime=', takes, ' watcher count=', countAngularWatchers());
            }

            if (takes > $window._debug.threshold) {
                $window._debug.digestList.push({
                    'digest': uuid,
                    dateTime: moment().format(),
                    execTime: takes.toFixed(2),
                    watcherCount: countAngularWatchers()
                });
                $log.error('$digest' + uuid, 'execTime=', takes.toFixed(2), ' watcher count=', countAngularWatchers());
            }

            if ($window._debug.profile) {
                console.profileEnd('$digest' + uuid);
            }
        };
        $rootScope.$digest = $newDigest;
    }

})();
