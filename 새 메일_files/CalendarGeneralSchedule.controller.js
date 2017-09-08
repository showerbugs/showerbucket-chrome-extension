(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .controller('CalendarGeneralScheduleModalCtrl', CalendarGeneralScheduleModalCtrl);

    /* @ngInject */
    function CalendarGeneralScheduleModalCtrl($scope, DetailInstanceFactory, _) {
        $scope.selectedItem = DetailInstanceFactory.getOrMakeSelectedItem('schedule');

        function init() {
            $scope.selectedItem.setParam(_.get($scope.model, 'raw.id'));
        }

        init();
    }

})();
