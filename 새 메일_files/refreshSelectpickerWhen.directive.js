(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('refreshSelectpickerWhen', RefreshSelectpickerWhen);

    /* @ngInject */
    function RefreshSelectpickerWhen() {
        // TODO watch true 제거
        return {
            restrict: 'A',
            scope: {
                refresh: '=refreshSelectpickerWhen'
            },
            link: function postLink(scope, element/*, attrs*/) {
                var watchHandler = scope.$watch('refresh', function () {
                    $timeout(function () {
                        element.selectpicker('refresh');
                    }, 0, false);
                }, true);

                $scope.$on('$destroy', function () {
                    watchHandler();
                });
            }
        };
    }

})();
