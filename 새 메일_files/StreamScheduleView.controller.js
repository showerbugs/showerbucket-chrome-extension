(function () {

    'use strict';

    angular
        .module('doorayWebApp.stream')
        .controller('StreamScheduleViewCtrl', StreamScheduleViewCtrl);

    /* @ngInject */
    function StreamScheduleViewCtrl($scope, ITEM_TYPE, DetailInstanceFactory) {
        $scope.selectedItem = DetailInstanceFactory.getOrMakeStreamItem(ITEM_TYPE.SCHEDULE);

        $scope.cancel = function () {
            $scope.selectedItem.reset();
        };
    }

})();
