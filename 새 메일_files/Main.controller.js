(function () {

    'use strict';

    angular
        .module('doorayWebApp.layout')
        .controller('MainCtrl', MainCtrl);

    /* @ngInject */
    function MainCtrl($scope, $state, HelperConfigUtil, MessageModalFactory, SettingModalFactory, gettextCatalog) {
        $scope.enableNewFeature = HelperConfigUtil.enableNewFeature();

        $scope.showUnderConstruction = function () {
            MessageModalFactory.alert(gettextCatalog.getString('준비 중입니다.'));
        };

        $scope.getViewStateName = function () {
            var state = $state.current.name;
            return state.indexOf('view') !== -1 ?
                state : state + '.view';
        };

        $scope.openSettingModal = function (openTarget) {
            SettingModalFactory.open(openTarget);
        };

    }

})();
