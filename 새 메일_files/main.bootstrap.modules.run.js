/**
 * @ngdoc overview
 * @name doorayWebApp.main.bootstrap
 * @description
 * # doorayWebApp.main.bootstrap
 *
 * Index Router Config module of the application.
 */

(function () {

    'use strict';

    angular
        .module('doorayWebApp.main.bootstrap')
        //.config(configStateProvider);
        //.run(runLazyLoadInitalize);

        .run(runInitializeUiRouter)
        .run(runInitializeFavicon)
        .run(runInitializeI18n)
        .run(runInitializeSetChangeLocaleFunc)
        .run(runInitializeWebSocket); //TODO 프로젝트, 메일 캘린더의 의존성을 포함하는 것은 main.modues에서 제거되야 한다.
    //.run(runNoticeInitialize);


    ///* @ngInject */
    //function configStateProvider($stateProvider) {
    //    //Function to get the state that matches a path
    //    //https://github.com/angular-ui/ui-router/issues/1651
    //    $stateProvider.decorator('parent', function (internalStateObj, parentFn) {
    //        // This fn is called by StateBuilder each time a state is registered
    //
    //        // The first arg is the internal state. Capture it and add an accessor to public state object.
    //        internalStateObj.self.$$state = function () {
    //            return internalStateObj;
    //        };
    //
    //        // pass through to default .parent() function
    //        return parentFn(internalStateObj);
    //    });
    //}

    ///* @ngInject */
    //function runLazyLoadInitalize($$animateJs, $ocLazyLoad, $injector) {
    //    //injection force for ocLazyload $$animateJs, $sanitize
    //    //https://github.com/ocombe/ocLazyLoad/issues/321
    //
    //
    //    $ocLazyLoad.load([
    //        'Autolinker.js',
    //        'addressparser',
    //        'clipboard',
    //        'cryptojslib',
    //        'mousetrap',
    //        'http-status-codes'
    //    ], {cache: false})
    //        .then(function () {
    //            return $ocLazyLoad.load(['doorayWebApp.vendor'], {cache: false});
    //        }).then(function () {
    //            return $ocLazyLoad.load(['doorayWebApp.components.modules'], {cache: false}).then(function () {
    //                return $ocLazyLoad.load(['doorayWebApp.components'], {cache: false});
    //            });
    //        }).then(function () {
    //            return $ocLazyLoad.load(['flow.js'], {cache: false}).then(function () {
    //                return $ocLazyLoad.load(['fusty-flow.js'], {cache: false});
    //            }).then(function () {
    //                return $ocLazyLoad.load(['ng-flow'], {cache: false});
    //            });
    //        }).then(function () {
    //            return $ocLazyLoad.load(['re-tree'], {cache: false}).then(function () {
    //                return $ocLazyLoad.load(['ng-device-detector'], {cache: false});
    //            });
    //        }).then(function () {
    //            return $ocLazyLoad.load(['d3'], {cache: false}).then(function () {
    //                return $ocLazyLoad.load(['nvd3'], {cache: false});
    //            }).then(function () {
    //                return $ocLazyLoad.load(['angular-nvd3'], {cache: false});
    //            });
    //        }).then(function () {
    //            return $ocLazyLoad.load(['nanoscroller'], {cache: false}).then(function () {
    //                return $ocLazyLoad.load(['angular-nanoscroller'], {cache: false});
    //            });
    //        }).then(function () {
    //            return $ocLazyLoad.load([
    //                'angular-gravatar',
    //                'angular-drag-and-drop-lists',
    //                'angular-native-dragdrop',
    //                'angular-ui-select',
    //                'angular-websocket',
    //                'angular-trello',
    //                'angular-filter',
    //                'angular-bootstrap-checkbox',
    //                'angular-growl-v2',
    //                'ngstorage',
    //                'ng-multi-transclude'
    //            ], {cache: false});
    //        }).then(function () {
    //            return $ocLazyLoad.load(['doorayWebApp.layouts.modules'], {cache: false}).then(function () {
    //                return $ocLazyLoad.load(['doorayWebApp.layouts'], {cache: false, rerun: true});
    //            });
    //        }).then(function () {
    //            return $ocLazyLoad.load(['doorayWebApp.project.modules'], {cache: false}).then(function () {
    //                return $ocLazyLoad.load(['doorayWebApp.project'], {cache: false, rerun: true});
    //            });
    //        }).then(function () {
    //            return $ocLazyLoad.load(['doorayWebApp.mail.modules'], {cache: false}).then(function () {
    //                return $ocLazyLoad.load(['doorayWebApp.mail'], {cache: false, rerun: true});
    //            });
    //        }).then(function () {
    //            return $ocLazyLoad.load(['doorayWebApp.stream.modules'], {cache: false}).then(function () {
    //                return $ocLazyLoad.load(['doorayWebApp.stream'], {cache: false, rerun: true});
    //            });
    //        }).then(function () {
    //            return $ocLazyLoad.load(['doorayWebApp.setting.modules'], {cache: false}).then(function () {
    //                return $ocLazyLoad.load(['doorayWebApp.setting'], {cache: false, rerun: true});
    //            });
    //        }).then(function () {
    //            return $ocLazyLoad.load(['doorayWebApp.popup.modules'], {cache: false}).then(function () {
    //                return $ocLazyLoad.load(['doorayWebApp.popup'], {cache: false, rerun: true});
    //            });
    //        }).then(function () {
    //            return $ocLazyLoad.load(['tui-code-snippet'], {cache: false}).then(function () {
    //                return $ocLazyLoad.load(['dooray-calendar'], {cache: false, rerun: true});
    //            }).then(function () {
    //                return $ocLazyLoad.load(['doorayWebApp.calendar.modules'], {cache: false, rerun: true});
    //            }).then(function () {
    //                return $ocLazyLoad.load(['doorayWebApp.calendar'], {cache: false, rerun: true});
    //            });
    //        }).then(function () {
    //            return $ocLazyLoad.load(['tui-code-snippet'], {cache: false}).then(function () {
    //                return $ocLazyLoad.load(['codemirror'], {cache: false});
    //            }).then(function () {
    //                return $ocLazyLoad.load(['highlightjs'], {cache: false});
    //            }).then(function () {
    //                return $ocLazyLoad.load(['markdown-it'], {cache: false});
    //            }).then(function () {
    //                return $ocLazyLoad.load(['toMark'], {cache: false});
    //            }).then(function () {
    //                return $ocLazyLoad.load(['squire-rte'], {cache: false});
    //            }).then(function () {
    //                return $ocLazyLoad.load(['tui-editor'], {cache: false});
    //            })./*then(function () {
    //             return $ocLazyLoad.load(['angular-sanitize'], {cache: false, rerun: true});
    //             }).*/then(function () {
    //                    return $ocLazyLoad.load(['doorayWebApp.render.modules'], {cache: false, rerun: true});
    //                }).then(function () {
    //                    return $ocLazyLoad.load(['doorayWebApp.render'], {cache: false, rerun: true});
    //                });
    //        }).then(function () {
    //            return $ocLazyLoad.load(['tinymce'], {cache: false}).then(function () {
    //                return $ocLazyLoad.load(['angular-ui-tinymce'], {cache: false, rerun: true});
    //            }).then(function () {
    //                return $ocLazyLoad.load(['doorayWebApp.editor.modules'], {cache: false, rerun: true});
    //            }).then(function () {
    //                return $ocLazyLoad.load(['doorayWebApp.editor'], {cache: false, rerun: true});
    //            });
    //        }).then(function () {
    //            var Router = $injector.get('Router');
    //            runUiRouterInitalize(Router);
    //
    //            $injector.invoke(runFaviconInitalize);
    //            $injector.invoke(runI18nInitalize);
    //            $injector.invoke(runSetChangeLocaleFunc);
    //            $injector.invoke(runWebSocketInitialize); //TODO 프로젝트, 메일 캘린더의 의존성을 포함하는 것은 main.modues에서 제거되야 한다.
    //            //$injector.invoke(runNoticeInitialize);
    //
    //            //project,mail,calendar 로딩 완료 후 호출하는 별도의 모듈 필요 (route 초기화 완료)
    //            $injector.invoke(runUiRouterWithLazyLoadInitalize);
    //
    //            /* @ngInject */
    //            function runUiRouterWithLazyLoadInitalize($location, $state, $window, _) {
    //                //Function to get the state that matches a path
    //                //https://github.com/angular-ui/ui-router/issues/1651
    //
    //                _.forEach($state.get(), function (state) {
    //                    if (_.isFunction(state.$$state) && state.$$state().url && state.$$state().url.exec($location.path(), $location.search())) {
    //                        $state.go(state, $location.search());
    //                    }
    //                });
    //
    //                $location.path($window.location.href);
    //                //console.timeEnd('oclazyLoad');
    //            }
    //
    //        });
    //}

    /* @ngInject */
    function runInitializeUiRouter(Router) {
        Router.when('/', routeCanPossibleService);
        Router.otherwise('/');

        /* @ngInject */
        function routeCanPossibleService(ServiceUseRouter) {
            ServiceUseRouter.routeCanPossibleService();
        }
    }

    /* @ngInject */
    function runInitializeFavicon($rootScope, FaviconChangeAction) {
        //if (!FaviconChangeActor.applyCurrentEnvFavicon()) {
        FaviconChangeAction.applyCurrentServiceFavicon();
        $rootScope.$on('$locationChangeSuccess', function () {
            FaviconChangeAction.applyCurrentServiceFavicon();
        });
        //}
    }

    /* @ngInject */
    function runInitializeI18n(HelperConfigUtil, HelperLocaleUtil, MyInfo, SaveBrowserI18nAction, moment) {
        var locale = HelperConfigUtil.locale() || HelperLocaleUtil.defaultLanguage(),
            timezone = HelperConfigUtil.timezone() || moment.tz.guess();
        if (!HelperConfigUtil.locale() || !HelperConfigUtil.timezone()) {
            MyInfo.updateMyInfo({locale: locale, timezoneName: timezone});
            HelperConfigUtil.locale(locale);
            HelperConfigUtil.timezone(timezone);
        }
        HelperLocaleUtil.setLanguage(locale, true);

        // TODO 추후에 제거 영구 쿠키를 제거하기 위한 코드
        SaveBrowserI18nAction.removeLocaleCookie();
    }

    /* @ngInject */
    function runInitializeSetChangeLocaleFunc($window, MyInfo) {
        // TODO REMOVE 개발 편의상 locale 정보를 변경하기 위한 global helper 메소드 할당
        $window._changeLocale = function (lang) {
            MyInfo.updateMyInfo({locale: lang}).then(function () {
                $window.location.reload();
            });
        };
    }

    /* @ngInject */
    function runInitializeWebSocket($location, $timeout,
                                    MailCountRepository, ProjectCountRepository, StreamCountRepository,
                                    NewMailArriveAction,
                                    VersionService, WebSocketService,
                                    _) {
        // 이 시점에는 state가 정의되지 않은 시점 그래서 location의 URL 매칭으로 찾음
        if (_.startsWith($location.url(), '/popup')) {
            return;
        }

        var randomTimer = Math.random() * 60 * 60 * 1000,
            wsFieldActions = {
                project: function (/*data*/) {
                    return ProjectCountRepository.fetchAndCache();
                },
                mail: function (data) {
                    if (_.get(data, 'params.type') === 'new_mail') {
                        //TODO ADDED by #dooray-메일/301
                        //TODO 신규 메일 도착 웹소켓 응답이 왔을 경우 현재 메일폴더일 경우 최 상단에 새 메일 injection
                        return NewMailArriveAction.assignNewMailInCurrentMailBoxItemList(_.get(data, 'params.folder'), _.get(data, 'params.mailId'));
                    }
                    return MailCountRepository.fetchAndCache();
                },
                stream: function (/*data*/) {
                    return StreamCountRepository.fetchAndCache();
                }
            };

        _fetchCountsAll();

        WebSocketService.createWebSocketInstance(null, function () {
            //WAS 배포 후 웹소켓의 reopen 시 count API의 동시 호출을 분산하도록 함
            $timeout(function () {
                _fetchCountsAll();
            }, randomTimer, false);
            VersionService.fetchAndCompare();
        }).subscribe(function (data) {
            if (!_.isEmpty(data.fields)/*data.version === 2*/) {
                _doActionsByFields(data.fields, data);
            }
        });

        function _fetchCountsAll() {
            _doActionsByFields(_.keys(wsFieldActions));
        }

        function _doActionsByFields(fields, data) {
            _.forEach(fields, function (field) {
                //console.log('_doActionsByFields action', wsFieldActions[field].toString(), data);
                wsFieldActions[field](data);
            });
        }
    }

    ///* @ngInject */
    //function runNoticeInitialize($cookies, $timeout, NoticeModalFactory) {
    //    //$rootScope.$on('$locationChangeSuccess', function () {
    //    //    WriteFormStack.recompositionQueryString();
    //    //});
    //    //
    //    //WriteFormStack.reopenFromQueryString();
    //
    //    //2017.03.06 Dooray 약관이 변경됨에 따라 기존 레이어로 띄우던 부분 제거
    //    var isNeverOpenNotice = $cookies.get('dooray_notice');
    //    if (angular.isUndefined(isNeverOpenNotice) || !isNeverOpenNotice) {
    //        $timeout(function () {
    //            // 바로 띄울 시에 언어설정이 반영안되는 문제가 있어서 timeout처리
    //            NoticeModalFactory.open();
    //        });
    //
    //    }
    //}

})();
