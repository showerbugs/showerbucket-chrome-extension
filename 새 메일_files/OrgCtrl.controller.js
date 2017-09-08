(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .controller('OrgCtrl', OrgCtrl);

    /* @ngInject */
    function OrgCtrl($q, $scope, $state, $timeout, MyInfo, TenantRepository, HelperConfigUtil, OrganizationBiz, PermissionFactory, adminOrgList, tenantRole, _) {
        $scope.enableNewFeature = HelperConfigUtil.enableNewFeature();
        $scope.myAdminOrgList = adminOrgList;
        $scope.scrollVersion = 1;

        var timer = null;

        function init() {
            $scope.tenantRole = tenantRole;
            $scope.selected = {};
            $scope.selected.code = $state.params.orgFilter || $scope.myAdminOrgList[0].code;
            $scope.selected.name = _.find($scope.myAdminOrgList, {code: $scope.selected.code}).name;
            _fetchTenantName();
        }

        function _fetchTenantName() {
            var tenantInfo = TenantRepository.getModel();
            var promise = _.isEmpty(tenantInfo) ? TenantRepository.fetchAndCache() : $q.when();
            promise.then(function () {
                $scope.tenantName = TenantRepository.getModel().name;
            });
        }

        $scope.refreshScroll = function () {
            $scope.scrollVersion +=1;
        };

        $scope.$watch(function () {
            return $state.current.data.navi;
        }, function (val) {
            $scope.naviList = val;
        });

        $scope.refreshMyInfo = function () {
            OrganizationBiz.resetCache();
            return MyInfo.resetCache().then(function(result) {
                return _getMyOrgList(result.contents());
            }).then(function (myOrgList) {
                $scope.myAdminOrgList = myOrgList;
                init();
            });
        };

        $scope.showResultMsg = function (msg) {
            $scope.resultMsg = msg;
            if ($scope.isShowingResultMsg) {
                return timer;
            }

            $scope.isShowingResultMsg = true;
            timer = $timeout(function () {
                $scope.isShowingResultMsg = false;
            }, 1000);
            return timer;
        };

        init();

        function _getMyOrgList(myInfo) {
            if (!PermissionFactory.hasTenantRole('admin', myInfo.tenantMemberRole)) {
                return MyInfo.getMyAdminOrgList();
            }

            return OrganizationBiz.fromServer().then(function (result) {
                $scope.refreshScroll();
                return result.contents();
            });
        }

    }

})();
