(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .controller('CalendarSettingCtrl', CalendarSettingCtrl);


    /* @ngInject */
    function CalendarSettingCtrl($scope) {

        var init = function () {
            $scope.current = {};
            $scope.current.tab = 'private';
        };

        $scope.changeTab = function (tab) {
            $scope.current.tab = tab;
        };

        init();

    }
})();
