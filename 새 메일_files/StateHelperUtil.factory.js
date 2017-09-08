(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .factory('StateHelperUtil', StateHelperUtil);

    /* @ngInject */
    function StateHelperUtil($state, _) {

        return {
            getCurrentStateName: getCurrentStateName,
            getCurrentStateParams: getCurrentStateParams,
            isViewStateByName: isViewStateByName,
            computeListStateNameByName: computeListStateNameByName,
            computeViewStateNameByName: computeViewStateNameByName,
            isViewStateByCurrentState: isViewStateByCurrentState,
            computeCurrentListStateName: computeCurrentListStateName,
            computeCurrentViewStateName: computeCurrentViewStateName
        };

        function getCurrentStateName() {
            return $state.current.name;
        }

        function getCurrentStateParams() {
            return $state.params;
        }

        function isViewStateByName(stateName) {
            return _.endsWith(stateName, '.view');
        }

        function computeListStateNameByName(listOrViewStateName) {
            return listOrViewStateName.replace('.view', '');
        }

        function computeViewStateNameByName(listOrViewStateName) {
            return isViewStateByName(listOrViewStateName) ? listOrViewStateName : listOrViewStateName + '.view';
        }

        function isViewStateByCurrentState() {
            return isViewStateByName($state.current.name);
        }

        function computeCurrentListStateName() {
            return computeListStateNameByName($state.current.name);
        }

        function computeCurrentViewStateName() {
            return computeViewStateNameByName($state.current.name);
        }
    }

})();
