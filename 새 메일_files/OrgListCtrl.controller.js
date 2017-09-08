(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .controller('OrgListCtrl', OrgListCtrl);


    /* @ngInject */
    function OrgListCtrl($scope, $state, ProjectMembersModalFactory, OrganizationBiz, OrgModalFactory, IdProviderBiz, _) {

        var init = function () {
            $scope.current = {};
            $scope.orgList = {};
            fetchList();
        };

        var fetchList = function () {
            OrganizationBiz.fromServer({
                extFields: 'memberCounts'
            }).then(function (result) {
                $scope.orgList = result.contents();
                $scope.orgTotalCount = result.totalCount();
                $scope.orgMemberTotalCount = _($scope.orgList).map(function(item) {
                    return _.sum(_.values(item.memberCounts));
                }).sum();
                $scope.refreshScroll();
            });
            //현재는 같은 테넌트면 같은 id-provider로 동작해서 오그별 id-provider 스팩이 추가되면
            //그 후 변경한다.
            IdProviderBiz.fetch().then(function(result){
                $scope.tenantIdProvider = _.map(result.contents(), 'name').join(', ');
            });
        };

        $scope.canShowSetting = function (id){
            return _.find($scope.myAdminOrgList, {id: id});
        };

        $scope.openSettingPage = function (code) {
            $state.go('.', {orgFilter: code, boxGroup: 'org_setting', boxName: 'general'}, {reload: true, inherit:false});
        };

        $scope.openOrgAddModal = function () {
            return OrgModalFactory.addOrg();
        };

        $scope.showAdminMembers = function (org) {
            ProjectMembersModalFactory.openOrgAdmin(org);
        };

        init();
    }
})();
