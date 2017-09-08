(function () {

    'use strict';

    angular
        .module('doorayWebApp.layout')
        .controller('CheckActionViewCtrl', CheckActionViewCtrl);

    /* @ngInject */
    function CheckActionViewCtrl($scope, CommonItemList, ListActionButtonBiz, StateParamsUtil, ProjectDashBoardService) {
        $scope.moveArchiveBox = moveArchiveBox;
        $scope.moveTrashBox = moveTrashBox;
        $scope.openSettings = openSettings;
        $scope.completeList = completeList;

        function moveArchiveBox() {
            ListActionButtonBiz.moveMails({targetFolderName: 'archive'});
        }

        function moveTrashBox() {
            ListActionButtonBiz.moveMails({targetFolderName: 'trash'});
        }

        function openSettings(targetTabName) {
            ProjectDashBoardService.openSettings(targetTabName, StateParamsUtil.getProjectCodeFilter());
        }

        function completeList() {
            ListActionButtonBiz.completeList().then(function () {
                CommonItemList.fetchList();
            });
        }
    }

})();
