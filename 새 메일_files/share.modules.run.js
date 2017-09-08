/**
 * @ngdoc overview
 * @name doorayWebApp.share
 * @description
 * # doorayWebApp.share
 *
 * Shared Config module of the application.
 */

(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .constant('localStorage', window.localStorage)
        .constant('Clipboard', window.Clipboard)
        .constant('Mousetrap', window.Mousetrap)
        .constant('httpStatusCode', window.httpStatusCode)
        .constant('API_CONFIG', {
            wasContext: 'v2/wapi',
            wasTaskContext: 'v2/wapi/task-tracker'
        })
        .constant('USER_TYPE', {
            MEMBER: 'member',
            EMAIL_USER: 'emailUser',
            PROJECT_MEMBER_GROUP: 'group'
        })
        .constant('API_PAGE_SIZE', {
            DEFAULT: 50,
            STREAM: 40,
            POST: 30,
            LIST_VIEW: 40,
            MAIL: 50,
            COMMENT: 20,
            ALL: 10000,
            SEARCH: 20,
            IN_ORG_SETTING: 100,
            SHARED_LINK: 20
        })
        .constant('API_ERROR_CODE', {
            USER_INVALID_TAG_MANDATORY_PREFIX: -200307,
            SERVER_PROJECT_TAG_IN_USE: -200304,
            SERVER_PROJECT_MILESTONE_IN_USE: -200223,
            USER_INVALID_TASK_OVERWRITE: -200308,
            SERVICE_RESOURCE_POST_DELETED: -100205,
            SERVICE_RESOURCE_POST_MOVED: -100206
        })
        .constant('KEYS', {
            ESC: 27,
            BACKSPACE: 8,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            DELETE: 46,
            TAB: 9,
            ENTER: 13,
            ALT: 18,
            SEMICOLON: 186
        })
        .constant('SUBMIT_FORM_MODES', {
            NEW: 'new',
            DRAFT: 'draft',
            UPDATE: 'update'
        })
        .constant('ALLOW_HTML_DOMAINS', [
            'nhnent.dooray.com',
            'comico.dooray.com',
            'commerce.dooray.com'
        ])
        .constant('IMAGE_CONFIG', {
            defaultProfile: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PGRlZnMvPjxyZWN0IHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgZmlsbD0iI0VFRUVFRSIvPjxnPjx0ZXh0IHg9IjEzLjQ2MDkzNzUiIHk9IjMyIiBzdHlsZT0iZmlsbDojQUFBQUFBO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1mYW1pbHk6QXJpYWwsIEhlbHZldGljYSwgT3BlbiBTYW5zLCBzYW5zLXNlcmlmLCBtb25vc3BhY2U7Zm9udC1zaXplOjEwcHQ7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+NjR4NjQ8L3RleHQ+PC9nPjwvc3ZnPg==',
            transparent1px: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
        })
        .constant('PATTERN_REGEX', {
            alphaNumDash: /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
            alphaNumDashDot: /^[a-z\d][a-z\d\-\.]+[a-z\d]$/,
            email: /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/,
            notAllowSpecialNameRule: /^[^~!@#$%\^&\*()_+=;\"\',<>?\/\|\\`]+$/,   //맨마지막에 억음부호 포함 [] {} 공백은 미포함 https://nhnent.dooray.com/project/projects/Dooray-obt/456 - 마일스톤명 적용패턴
            projectCodeOrMemberGroup: /^[a-zA-Z0-9\(\)\-\.~\u3131-\u314E\u314F-\u3163\uAC00-\uD7A3\u3040-\u309F\u30A0-\u30FF\u3400-\u4DB5\u4E00-\u9FCC]+$/, //영문,숫자,한글,일본어,중국어 '.' () - _ 만 허용하는 프로젝트 코드 전용패턴 https://nhnent.dooray.com/project/projects/Dooray-obt/629
            calendarName: /^[a-zA-Z0-9\(\)\-\.:_&\s\u3131-\u314E\u314F-\u3163\uAC00-\uD7A3\u3040-\u309F\u30A0-\u30FF\u3400-\u4DB5\u4E00-\u9FCC]+$/,
            tagOrMilestoneName: /^[a-zA-Z0-9()\-.:_&\u3131-\u314E\u314F-\u3163\uAC00-\uD7A3\u3040-\u309F\u30A0-\u30FF\u3400-\u4DB5\u4E00-\u9FCC][ a-zA-Z0-9()\-.:_&\u3131-\u314E\u314F-\u3163\uAC00-\uD7A3\u3040-\u309F\u30A0-\u30FF\u3400-\u4DB5\u4E00-\u9FCC]*$/,  //영문,숫자,한글,일본어,중국어 공백 ()-.:_&만 허용 https://nhnent.dooray.com/project/projects/Dooray-obt/3147
            cssColor: /^#([A-Fa-f0-9]{3}){1,2}$/,
            doorayId: /^[0-9]{19}$/,
            projectCodeInSearchParam: /projectCode=([^&]+)&?/,
            cidr: /^((?:(?:1?[0-9]?[0-9])|(?:2(?:[0-4][0-9]|5[0-5])))\.){3}(?:(?:1?[0-9]?[0-9])|(?:2(?:[0-4][0-9]|5[0-5])))(\/([0-9]|[1-2][0-9]|3[0-2]))?$/,
            domain: /^[a-z\d]*$/,
            orgName: /^[a-zA-Z0-9\s+\u3131-\u314E\u314F-\u3163\uAC00-\uD7A3\u3040-\u309F\u30A0-\u30FF\u3400-\u4DB5\u4E00-\u9FCC]+$/,
            userCode: /^[a-z\d]([a-z\d\-_\.]?[a-z\d])*$/,
            password: /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^0-9a-zA-Z]).{8,}$/
        })
        .constant('API_PAGE_SIZE', {
            DEFAULT: 50,
            STREAM: 40,
            POST: 30,
            LIST_VIEW: 40,
            MAIL: 50,
            COMMENT: 20,
            ALL: 10000,
            SEARCH: 20,
            IN_ORG_SETTING: 100,
            SHARED_LINK: 20
        })
        .constant('TAG_COLOR_SET', [
            ['#ffd3ce', '#d36255', '#ffedeb'],
            ['#ffdaaf', '#d7721b', '#fff2e4'],
            ['#f3e58b', '#b19900', '#fffbe4'],
            ['#c6eab3', '#43b903', '#efffe7'],
            ['#bdf4f3', '#22a1a1', '#e7fffe'],
            ['#bae1ff', '#4091d0', '#ecf7ff'],
            ['#cfc8ff', '#887cda', '#f2f0ff'],
            ['#edc6fa', '#b857d8', '#fbf0ff'],
            ['#ffcedd', '#d75c82', '#fff1f5'],
            ['#d8d8d8', '#666666', '#f6f6f6']
        ])
        .config(['$uibModalProvider', function ($uibModalProvider) {
            $uibModalProvider.options.animation = false;
        }])
        .config(['$ariaProvider', function ($ariaProvider) {
            $ariaProvider.config({tabindex: false});
        }])
        .config(['$httpProvider', function ($httpProvider) {
            //initialize get if not there
            if (!$httpProvider.defaults.headers.get) {
                $httpProvider.defaults.headers.get = {};
            }
            //disable IE ajax request caching
            $httpProvider.defaults.headers.get['If-Modified-Since'] = 'no-cache';
            $httpProvider.defaults.transformResponse.push(function (data/*, headerGetter*/) {
                //  $httpProvider interceptors response callback의 arguments[0].data에 할당될 값이므로 변경에 대한 세부적인 검토가 필요함
                return data;
            });

            //http://blog.brunoscopelliti.com/http-response-interceptors
            //http://www.webdeveasy.com/interceptors-in-angularjs-and-useful-examples/
            $httpProvider.interceptors.push(httpProviderGeneralConfigHandler);

            //서비스 오류발생에 대한 Dialog 로 사용자에게 노출하기 위한 interceptors;
            $httpProvider.interceptors.push(httpProviderResponseErrorHandler);


            /* @ngInject */
            function httpProviderGeneralConfigHandler($injector, $q, ResponseWrapAppendHelper, _) {
                return {
                    'request': function (config) {
                        //TODO DEPRECATED inject global response timeout 15s if not set
                        config.timeout = config.timeout || 15000;
                        return config;
                    },
                    'response': function (response) {
                        var data = response.data,
                            ignoreErrorMap = _.get(response, 'config.ignore', {}),
                            isRawData = _.get(response, 'config.raw', false);

                        if (isRawData) {
                            response.data = {raw: data};
                            return response;
                        }

                        //모든 XHR API 응답
                        if (angular.isObject(data) && data.header) {
                            if (data.header.isSuccessful === false) {
                                var isIgnoreError = _.isFunction(ignoreErrorMap.isSuccessfulFalsy) ? ignoreErrorMap.isSuccessfulFalsy(data, response.config) : !!ignoreErrorMap.isSuccessfulFalsy;
                                isIgnoreError = isIgnoreError ||
                                    (_.isArray(ignoreErrorMap.resultCode) ?
                                        _.includes(ignoreErrorMap.resultCode, data.header.resultCode) :
                                    data.header.resultCode === ignoreErrorMap.resultCode) ||
                                    false;
                                if (!isIgnoreError) {
                                    showAlertMessageModal($injector, data.header.resultMessage || getTextMessageByInjector($injector, '<p>서버 오류가 발생하였습니다.</p><p>해당 오류는 서비스 운영자에게 자동으로 보고됩니다.</p>'));
                                }
                                return $q.reject(response);
                            }

                            //성공한 XHR API 응답으로 서비스에서 사용할 최종 result에 대한 wrapper를 대체하여 사용
                            response.data = ResponseWrapAppendHelper.create(response.data.result, data.header);
                            //XHR API Data 응답속도 시뮬레이션
                            //return $timeout(function(){
                            //    return response;
                            //}, 10000);
                        }

                        return response;
                    }
                };
            }


            /* @ngInject */
            function httpProviderResponseErrorHandler($injector, $q, $window, HelperPromiseUtil, httpStatusCode, _) {
                return {
                    // The HTTP response was not successful. !( 200 <= status < 300 or status === 304 )
                    'responseError': function (errorResponse) {
                        if (errorResponse.config.ignore) {
                            //1. 알림 써머리가 30초 주기로 호출되므로 배포 시마다 Alert Dialog 실행이되는 부분 스킵
                            //2. 프로젝트 테스크+메시지 목록 요청인 경우 에러 발생 시에도 얼럿 노출  제외함
                            var ignoreResponseError = errorResponse.config.ignore.responseError;
                            if (_.isFunction(ignoreResponseError) ? ignoreResponseError(errorResponse.config) : !!ignoreResponseError) {
                                return $q.reject(errorResponse);
                            }
                        }
                        var data = errorResponse.data;
                        switch (errorResponse.status) {
                            case -1 :
                                if (!HelperPromiseUtil.isPromiseLike(errorResponse.config.timeout)) {  //timeout resolved from resorceFactory
                                    showAlertMessageModal($injector, getTextMessageByInjector($injector, '<p>일시적인 오류입니다.</p><p>다시 한번 시도해 주세요.</p>'));
                                }
                                break;
                            case httpStatusCode.UNAUTHORIZED :  //401
                                showConfirmMessageModal($injector, getTextMessageByInjector($injector, '로그인이 필요합니다.'), function () {
                                    $window.location.reload();
                                });
                                break;
                            case httpStatusCode.FORBIDDEN : //403
                                showAlertMessageModal($injector, getTextMessageByInjector($injector, '접근 권한이 없습니다.'));
                                break;
                            case httpStatusCode.NOT_FOUND : //404
                                var ngHtmlReq = /\.html$/.test(errorResponse.config.url);
                                var message = getTextMessageByInjector($injector, '요청한 내용을 찾을 수 없습니다.');
                                message += ngHtmlReq ? '<p>' + errorResponse.config.url + '</p>' : '';
                                showAlertMessageModal($injector, message);
                                break;
                            default :
                                if (data && data.header) {
                                    showAlertMessageModal($injector, data.header.msg, data.header.detail || errorResponse.statusText);
                                } else {  //TODO WILL BE REMOVE WHEN ready to use data.header
                                    showAlertMessageModal($injector, getTextMessageByInjector($injector, '서버측 응답 에러'));
                                }
                        }
                        return $q.reject(errorResponse);
                    }
                };
            }

            function showAlertMessageModal($injector, message, callbackOk) {
                return $injector.invoke(['$q', 'MessageModalFactory', function ($q, MessageModalFactory) {
                    callbackOk = callbackOk || $q.when;
                    return MessageModalFactory.alert(message).result.then(callbackOk);
                }]);
            }

            function showConfirmMessageModal($injector, message, callbackOk, callbackCancel) {
                return $injector.invoke(['$q', 'MessageModalFactory', function ($q, MessageModalFactory) {
                    callbackOk = callbackOk || $q.when;
                    callbackCancel = callbackCancel || $q.reject;
                    return MessageModalFactory.confirm(message).result.then(callbackOk, callbackCancel);
                }]);
            }

            function getTextMessageByInjector($injector, message, data) {
                return $injector.invoke(['gettextCatalog', function (gettextCatalog) {
                    return gettextCatalog.getString(message, data);
                }]);
            }
        }])
        .run(runDisableNgAnimation)
        .run(runInitialize);

    /* @ngInject */
    function runDisableNgAnimation($animate) {
        //Disable or enable the animation globally on the $animate service:
        //FIXME: flex + ui-router를 동시에 사용 시 기존 ui-view와 신규 ui-view가 동시에 발생되는 문제로 인해 해결될때 까지 전역적으로 $animation 비활성화
        $animate.enabled(false);
    }

    /* @ngInject */
    function runInitialize($rootScope, deviceDetector, moment, _) {
        // use in views, ng-repeat="x in _.range(3)"
        $rootScope._ = _;
        $rootScope.moment = moment;
        $rootScope.deviceDetector = deviceDetector;
    }

})();
