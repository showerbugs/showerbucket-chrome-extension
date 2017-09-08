(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .controller('OrgHeaderCtrl', OrgHeaderCtrl);

    /* @ngInject */
    function OrgHeaderCtrl($cookies, $scope, $state, $window, ORG_STATE_NAME, PROJECT_STATE_NAMES, DomainRepository, MyInfo, PopupUtil, RootScopeEventBindHelper, VersionService, moment, _) {
        function refresMyInfo() {
            MyInfo.getMyInfo().then(function(myInfo) {
                $scope.myInfo = myInfo;
            });
        }

        function findDefaultDomain() {
            DomainRepository.defaultDomainPromise().then(function (domain) {
                $scope.isNhnEntOrg = domain === 'nhnent.dooray.com';
            });
        }

        $scope.PROJECT_STATE_NAMES = PROJECT_STATE_NAMES;

        refresMyInfo();
        findDefaultDomain();

        RootScopeEventBindHelper.withScope($scope)
            .on(MyInfo.EVENTS.RESETCACHE, refresMyInfo)
            //WAS 빌드 버전정보 체크
            .on(VersionService.EVENTS.CHANGED, function () {
                $scope.detectedNewBuild = true;
            });

        $scope.refreshForNewVersion = function () {
            $window.location.reload();
        };

        $scope.checkedBrowserWarning = angular.fromJson($cookies.get('checkedBrowserWarning') || false);
        $scope.closeBrowserWarning = function () {
            $scope.checkedBrowserWarning = true;
        };

        $scope.checkNoDisplayBrowserWarning = function () {
            $cookies.put('checkedBrowserWarning', "true", {
                domain: 'dooray.com',
                expires: moment().add(3, 'months').toDate() //until after 3 months.
            });
            $scope.closeBrowserWarning();
        };

        $scope.openTaskWritePopupForClientQuestion = function () {
            PopupUtil.openTaskWritePopup('new', {
                type: 'new',
                projectCode: '(버그-개선)모든-플랫폼-솔루션',
                templateId: '1556397123916226747'
            });
        };

        $scope.changeOrg = function(org) {
            $scope.selected.code = org.code;
            $scope.selected.name = org.name || _.find($scope.myAdminOrgList, {code: org.cod}).name;
            $state.go('.', {orgFilter: org.code}, {reload: ORG_STATE_NAME});
        };
    }

})();
