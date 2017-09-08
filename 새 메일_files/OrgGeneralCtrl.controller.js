(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .controller('OrgGeneralCtrl', OrgGeneralCtrl);


    /* @ngInject */
    function OrgGeneralCtrl ($scope, $state, ORG_STATE_NAME, HelperFormUtil, OrganizationBiz, gettextCatalog, _) {

        $scope.FORM_NAME = 'orgForm';
        $scope.current = {};
        HelperFormUtil.bindService($scope, $scope.FORM_NAME);

        $scope.setOrganization = function() {
            $scope.current.organization = _.cloneDeep(_.find($scope.myAdminOrgList, {code: $scope.current.organizationCode}));
        };

        function init() {
            $scope.current.organizationCode = $state.params.orgFilter;
            $scope.setOrganization();
        }

        $scope.submit = function () {
            if (HelperFormUtil.checkInvaild($scope[$scope.FORM_NAME])) {
                return;
            }

            OrganizationBiz.modifyOrganization($scope.current.organizationCode, $scope.current.organization).then(function(){
                $scope.refreshMyInfo().then($scope.setOrganization);
                var isStateGo = true;
                $scope.$on('$stateChangeStart', function () {
                    isStateGo = false;
                });
                $scope.refreshScroll();

                $scope.showResultMsg(gettextCatalog.getString("저장되었습니다.")).then(function () {
                    if (isStateGo) {
                        $state.go('.', {boxGroup: 'org_setting', boxName: 'general'}, {reload: ORG_STATE_NAME});
                    }
                });
            });
        };

        $scope.cancel = function (){
            $scope.setOrganization();
        };

        init();
    }
})();
