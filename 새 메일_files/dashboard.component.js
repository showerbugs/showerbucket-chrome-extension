(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('dashBoard', {
            /* @ngInject */
            templateUrl: function ($state, PROJECT_STATE_NAMES) {
                return $state.includes(PROJECT_STATE_NAMES.TO_BOX) ?
                    'modules/project/view/dashBoard/dashBoard.to.html':
                    'modules/project/view/dashBoard/dashBoard.project.html';
            },
            controller: dashBoard,
            bindings: {
                toBox: '&'
            }
        });

    /* @ngInject */
    function dashBoard(ProjectDashBoardService, StateParamsUtil) {
        var $ctrl = this;

        $ctrl.openSettings = function(name) {
            ProjectDashBoardService.openSettings(name, StateParamsUtil.getProjectCodeFilter());
        };

        //PreDefined Callback;

    }

})();
