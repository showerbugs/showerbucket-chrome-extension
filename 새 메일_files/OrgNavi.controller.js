(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .controller('OrgNaviCtrl', OrgNaviCtrl);

    /* @ngInject */
    function OrgNaviCtrl($scope, $state) {
        $scope.isActiveBox = isActiveBox;
        $scope.isActiveBoxGroup = isActiveBoxGroup;

        function isActiveBox(boxGroupKey, boxKey) {
            return isActiveBoxGroup(boxGroupKey) && $state.params.boxName === boxKey;
        }

        function isActiveBoxGroup(boxGroupKey) {
            return boxGroupKey === $state.params.boxGroup;
        }
    }

})();
