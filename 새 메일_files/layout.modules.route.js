(function () {

    'use strict';

    angular
        .module('doorayWebApp.layout')
        .run(runInitializeUiRouter);

    /* @ngInject */
    function runInitializeUiRouter(Router) {
        registerStateInfos();

        function registerStateInfos() {
            // state 정보 시작
            Router.registerState({
                'name': 'main',
                'controller': 'MainCtrl',
                'controllerAs': 'mainCtrl',
                'templateUrl': 'modules/layouts/main/page.html'
            });

            Router.registerState({
                'name': 'main.page',
                'views': {
                    'header': {
                        'template': '<page-header></page-header>'
                    },
                    'body': {
                        'controller': 'BodyContainerCtrl as containerCtrl',
                        'templateUrl': 'modules/layouts/main/BodyContainer/body.html'
                    },
                    'footer': {
                        'templateUrl': 'modules/layouts/main/Footer/footer.html'
                    }
                }/*,
                'onEnter': ['$cookies', '$rootScope', '$timeout', 'MyInfo', 'NoticeModalFactory',
                    function ($cookies, $rootScope, $timeout, MyInfo, NoticeModalFactory) {
                        // TODO 임시 코드
                        //$rootScope.$on('$locationChangeSuccess', function () {
                        //    WriteFormStack.recompositionQueryString();
                        //});
                        //
                        //WriteFormStack.reopenFromQueryString();

                        //2017.01.06 Dooray 약관이 변경됨에 따라 기존 레이어로 띄우던 부분 제거
                        var isNeverOpenNotice = $cookies.get('dooray_notice');
                        if (angular.isUndefined(isNeverOpenNotice) || !isNeverOpenNotice) {
                            $timeout(function () {
                                // 바로 띄울 시에 언어설정이 반영안되는 문제가 있어서 timeout처리
                                MyInfo.getMyInfo().then(function (myInfo) {
                                    if (_.get(myInfo._wrap.refMap.userMap(myInfo.userId), 'idProviderId') !== '4') {
                                        NoticeModalFactory.open();
                                    }
                                });
                            });

                        }
                    }]*/
            });
            Router.registerState({
                'name': 'main.page.empty',
                'url': '/empty',
                'views': {
                    'body@main': {
                        'templateUrl': 'modules/layouts/main/emptyServicePage.html'
                    }
                }
            });
            Router.registerState({
                'name': 'main.page.setting',
                'url': '/project/setting/:setting',
                'onEnter': ['$stateParams', 'SettingModalFactory', function($stateParams, SettingModalFactory){
                    SettingModalFactory.open($stateParams.setting);
                }]
            });
        }
    }

})();
