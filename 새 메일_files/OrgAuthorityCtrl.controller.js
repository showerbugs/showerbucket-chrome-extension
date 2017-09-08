(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .controller('OrgAuthorityCtrl', OrgAuthorityCtrl);


    /* @ngInject */
    function OrgAuthorityCtrl($scope, $state, adminOrgList, SettingsProjectsBiz, PermissionFactory, gettextCatalog, _) {

        var organizationCode = $state.params.orgFilter || $scope.myAdminOrgList[0].code,
            settings = {};

        $scope.fetchSetting = fetchSetting;
        $scope.submit = submit;

        $scope.cancel = function () {
            setCurrentSetting();
        };

        _init();

        function fetchSetting() {
            PermissionFactory.fetchSettingsProjects().then(function (result) {
                settings = result;
                setCurrentSetting(result);
                $scope.refreshScroll();
            });
        }

        function submit() {
            $scope.current.setting.dueDate = $scope.current.selectedMonth === 'input' ?
                $scope.current.inputMonth : $scope.current.selectedMonth;
            $scope.hasExpiredError = !$scope.current.setting.dueDate;
            if ($scope.hasExpiredError) {
                return;
            }
            $scope.current.setting.dueDate *= 30;
            SettingsProjectsBiz.update(organizationCode, $scope.current.setting).then(function () {
                $scope.fetchSetting();
                $scope.showResultMsg(gettextCatalog.getString("저장되었습니다."));
                $scope.refreshScroll();
            });
        }

        function _init() {
            $scope.current = {};
            $scope.hasExpiredError = false;

            $scope.expiredOptions = _([1, 3, 6, 12]).map(function (month) {
                return { name: [month, gettextCatalog.getString('개월')].join(''), month: month};
            }).concat({ name: gettextCatalog.getString('직접 입력'), month: 'input'}).value();
            $scope.fetchSetting();
        }

        function setCurrentSetting() {
            var orgId =  _.find(adminOrgList, {code: organizationCode}).id;
            $scope.current.setting = _.cloneDeep(_.find(settings, {organizationId: orgId}).value);
            var month = Math.ceil($scope.current.setting.dueDate / 30);
            $scope.current.selectedMonth = month ?
                _.get(_.find($scope.expiredOptions, {month: month}), 'month', 'input') : $scope.expiredOptions[1].month;
            $scope.current.inputMonth = $scope.current.selectedMonth === 'input' ? month : $scope.current.selectedMonth;
        }
    }
})();
