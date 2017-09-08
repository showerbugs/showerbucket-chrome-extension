(function () {

    'use strict';

    angular
        .module('doorayWebApp.layout')
        .controller('BodyContainerCtrl', BodyContainerCtrl);

    /* @ngInject */
    function BodyContainerCtrl($scope, EMIT_EVENTS, PROJECT_STATE_NAMES, ResizeDividingElementFactory) {
        var isFirst = true;
        $scope.EMIT_EVENTS = EMIT_EVENTS;
        _init();

        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
            ResizeDividingElementFactory.setScreenMode(ResizeDividingElementFactory.SCREEN_MODE.NORMAL, 'view');

            if (!isFirst &&
                (_isChangeStateTo(PROJECT_STATE_NAMES.PROJECT_STATE, toState, fromState))) {
                ResizeDividingElementFactory.getDivider('navi').reset();
            }
            isFirst = false;
        });

        $scope.changeDetailViewMode = function () {
            ResizeDividingElementFactory.toggleScreenMode('view');
        };

        function _init() {
            ResizeDividingElementFactory.clear();
        }

        function _isChangeStateTo(target, toState, fromState) {
            return toState.name.indexOf(target) > -1 && fromState.name.indexOf(target) === -1;
        }
    }

})();
