(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .controller('OrgCompanyCtrl', OrgCompanyCtrl);

    /* @ngInject */
    function OrgCompanyCtrl($scope, $state, ORG_STATE_NAME, HelperFormUtil, Member, TenantRepository, gettextCatalog, _) {
        var FORM_NAMES = {
                company: 'companyForm',
                admin: 'adminForm'
            },
            formByTab = {
                company: {
                    init: _initCompany,
                    submit: _submitCompany
                },
                admin: {
                    init: _initAdmin,
                    submit: _submitAdmin
                }
            };

        $scope.TenantRepository = TenantRepository;
        $scope.currentTabName = 'company';
        $scope.FORM_NAME = FORM_NAMES[$scope.currentTabName];
        $scope.current = {
            tenant: {}
        };
        $scope.changeTab = changeTab;
        $scope.submit = submit;
        $scope.cancel = cancel;

        _init();

        function changeTab(tabName) {
            $scope.currentTabName = tabName;
            $scope.FORM_NAME = FORM_NAMES[$scope.currentTabName];
            _init();
        }

        function cancel() {
            $scope.current.tenant = TenantRepository.getModel();
        }

        function submit() {
            if (HelperFormUtil.checkInvaild($scope[$scope.FORM_NAME])) {
                return;
            }

            formByTab[$scope.currentTabName].submit();
        }

        function _init() {
            formByTab[$scope.currentTabName].init();
            HelperFormUtil.bindService($scope, $scope.FORM_NAME);
        }

        function _initCompany() {
            TenantRepository.fetchAndCache().then(function () {
                $scope.current.tenant = _.cloneDeep(TenantRepository.getModel());
            });
        }

        function _submitCompany() {
            if (_.isEmpty($scope.current.tenant)) {
                return;
            }

            var form = {
                name: $scope.current.tenant.name,
                description: $scope.current.tenant.description
            };

            TenantRepository.update(form).then(function () {
                $state.go('.', {}, {reload: ORG_STATE_NAME});
                $scope.showResultMsg(gettextCatalog.getString("저장되었습니다."));
            });
        }

        function _initAdmin() {
            Member.fetchList({tenantMemberRoles: 'owner'}).then(function (result) {
                $scope.current.tenantAdmin = result.contents()[0];
                $scope.refreshScroll();
            });
        }

        function _submitAdmin() {
            if (_.isEmpty($scope.current.tenantAdmin)) {
                return;
            }

            $scope.showResultMsg(gettextCatalog.getString("저장되었습니다."));
        }
    }

})();
