(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .controller('OrgSharedLinkCtrl', OrgSharedLinkCtrl);


    /* @ngInject */
    function OrgSharedLinkCtrl($scope, $state, _) {

        $scope.organization = _.find($scope.myAdminOrgList, {code: $state.params.orgFilter}) || $scope.myAdminOrgList[0];
    }
})();
