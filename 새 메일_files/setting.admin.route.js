(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .run(runInitializeUiRouter);

    /* @ngInject */
    function runInitializeUiRouter(ORG_BOX_INFO, ORG_STATE_NAME, Router) {

        Router.when('/org/**', '/org/org_setting/general');
        Router.when('/org/org_setting', ['$state', '$stateParams', function ($state, $stateParams) {
            $state.go(ORG_STATE_NAME, {viewName: 'general', orgFilter: $stateParams.orgFilter});
        }]);
        Router.when('/org/info', '/org/info/orgList');
        registerStateInfos();

        function stateGo(stateName, param, option, $state, $timeout) {
            $timeout(function () {
                $state.go(stateName, param, option);
            }, 0, false);
        }

        function registerStateInfos() {
            Router.registerState({
                name: ORG_STATE_NAME,
                url: '/org/{boxGroup}/{boxName}?{orgFilter:string}',
                data: {
                    navi: ORG_BOX_INFO
                },
                /* @ngInject */
                onEnter: function ($stateParams, $state, $timeout, ORG_BOX_INFO, PROJECT_STATE_NAMES, HelperConfigUtil, adminOrgList, _) {
                    ORG_BOX_INFO[$stateParams.boxGroup].isOpen = true;
                    if (_.isEmpty(adminOrgList)) {
                        stateGo(PROJECT_STATE_NAMES.TO_BOX, {filterStoreMode: true}, {reload: true, inherit: false}, $state, $timeout);
                        return;
                    }

                    if (
                        !$stateParams.orgFilter || !_.find(adminOrgList, {code: $stateParams.orgFilter}) || // orgFilter에 없는 경우
                        (!HelperConfigUtil.enableNewFeature() && ORG_BOX_INFO[$stateParams.boxGroup].menus[$stateParams.boxName].enableNewFeature) // enableNewFeature가 아닌경우
                    ) {
                        stateGo(ORG_STATE_NAME, { boxGroup: 'org_setting', boxName: 'general', orgFilter: adminOrgList[0].code }, {reload: true}, $state, $timeout);
                    }
                },
                /* @ngInject */
                onExit: function ($stateParams, ORG_BOX_INFO) {
                    ORG_BOX_INFO[$stateParams.boxGroup].isOpen = false;
                },
                views: {
                    '@': {
                        templateUrl: 'modules/setting/admin/org.html',
                        controller: 'OrgCtrl as ortCtrl'
                    },
                    'header@main.org': {
                        controller: 'OrgHeaderCtrl as orgHeaderCtrl',
                        templateUrl: 'modules/setting/admin/header/header.html'
                    },
                    'footer@main.org': {
                        templateUrl: 'modules/layouts/main/Footer/footer.html'
                    },
                    'navi@main.org': {
                        controller: 'OrgNaviCtrl',
                        templateUrl: 'modules/setting/admin/navi/navi.html'
                    },
                    'contents@main.org': {
                        /* @ngInject */
                        controllerProvider: function ($stateParams, ORG_BOX_INFO) {
                            return ORG_BOX_INFO[$stateParams.boxGroup].menus[$stateParams.boxName].controller;
                        },
                        /* @ngInject */
                        templateProvider: function ($stateParams, $templateCache, ORG_BOX_INFO) {
                            var boxInfo = ORG_BOX_INFO[$stateParams.boxGroup].menus[$stateParams.boxName];
                            return boxInfo.template || $templateCache.get(boxInfo.templateUrl);
                        }
                    }
                },
                resolve: {
                    /* @ngInject */
                    adminOrgList: function ($state, MyInfo, OrganizationBiz, PermissionFactory, PROJECT_STATE_NAMES) {
                        return MyInfo.getMyInfo().then(function (myInfo) {
                            if (!PermissionFactory.hasTenantRole('admin', myInfo.tenantMemberRole)) {
                                return MyInfo.getMyAdminOrgList();
                            }

                            return OrganizationBiz.get();
                        }).then(function (adminOrgList) {
                            if (adminOrgList.length <= 0) {
                                $state.go(PROJECT_STATE_NAMES.TO_BOX, {});
                            }
                            return adminOrgList;
                        });
                    },
                    /* @ngInject */
                    tenantRole: function ($state, MyInfo) {
                        return MyInfo.getMyInfo().then(function (myInfo) {
                            return myInfo.tenantMemberRole;
                        });
                    }
                }

            });
        }
    }

})();
