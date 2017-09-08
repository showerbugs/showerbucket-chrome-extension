(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .factory('OrgModalFactory', OrgModalFactory)
        .controller('OrgAddCtrl', OrgAddCtrl);

    /* @ngInject */
    function OrgModalFactory($q, $uibModal) {
        var modalInstance;

        return {
            addOrg: function () {
                modalInstance = $uibModal.open({
                        'templateUrl': 'modules/setting/admin/tenant/modal/orgAdd.html',
                        'controller': 'OrgAddCtrl',
                        'windowClass': 'setting-modal dooray-setting-content org-add-setting'
                    }

                );
                return $q.when(modalInstance);
            }

        };
    }

    /* @ngInject */
    function OrgAddCtrl ($scope, $state, $uibModalInstance, HelperFormUtil, HelperPromiseUtil, OrganizationBiz, MessageModalFactory, gettextCatalog) {
        var promise = null;
        $scope.FORM_NAME = 'orgForm';
        $scope.current = {
            organization: {}
        };
        HelperFormUtil.bindService($scope, $scope.FORM_NAME);

        $scope.submit = function () {
            if (HelperPromiseUtil.isResourcePending(promise) || HelperFormUtil.checkInvaild($scope[$scope.FORM_NAME])) {
                return;
            }
            var param = {
                name: $scope.current.organization.name,
                description: $scope.current.organization.description,
                code: $scope.current.organization.code
            };
            promise = OrganizationBiz.createOrganization(param).then(function () {
                MessageModalFactory.alert(gettextCatalog.getString("추가되었습니다."));
                $state.go('.', {boxGroup: 'info', boxName: 'orgList'});
                $scope.dismiss();
            });
        };

        $scope.dismiss = function () {
            $uibModalInstance.dismiss();
        };
    }

})();
