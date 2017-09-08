(function () {

    'use strict';

    angular
        .module('doorayWebApp.stream')
        .controller('StreamPostViewCtrl', StreamPostViewCtrl);

    /* @ngInject */
    function StreamPostViewCtrl($scope, ITEM_TYPE, DetailInstanceFactory) {
        $scope.selectedTask = DetailInstanceFactory.getOrMakeStreamItem(ITEM_TYPE.POST);
        $scope.shared = {
            isStreamModal: true
        };

        $scope.closeTaskView = function () {
            $scope.selectedTask.reset();
        };
    }
})();
