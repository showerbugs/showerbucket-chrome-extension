(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('doorayPosition', DoorayPosition);

    /* @ngInject */
    function DoorayPosition($parse, $timeout, $uibPosition) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $timeout(function () {
                    var result = {};
                    result[attrs.doorayPositionAction || 'position'] = $uibPosition[attrs.doorayPositionAction || 'position'](angular.element(element));
                    $parse(attrs.doorayPosition)(scope, result);
                }, 500, false);
            }
        };
    }

})();
