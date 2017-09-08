(function () {

    'use strict';

    angular
        .module('doorayWebApp.layout')
        .controller('PopupCtrl', PopupCtrl);

    /* @ngInject */
    function PopupCtrl($controller, $scope, $state, POPUP_STATE_NAMES) {
        $controller('MainCtrl', {$scope: $scope});
        $scope.isPopup = true;

        $scope.isPopupView = $state.includes(POPUP_STATE_NAMES.TASK_VIEW) ||
            $state.includes(POPUP_STATE_NAMES.MAIL_VIEW) ||
            $state.includes(POPUP_STATE_NAMES.CALENDAR_VIEW);
    }

})();
