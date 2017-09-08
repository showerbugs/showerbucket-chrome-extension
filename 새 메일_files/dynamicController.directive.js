/**
 * @ngdoc overview
 * @name dynamicController
 * @description
 * # dynamicController
 *
 * http://jsfiddle.net/mathieu/ShN25/
 */
(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('dynamicController', DynamicController);

    /* @ngInject */
    function DynamicController($controller) {
        return {
            scope: true,
            restrict: 'A',
            controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
                var locals = {
                    $scope: $scope,
                    $element: $element,
                    $attrs: $attrs
                };

                $element.data('$Controller', $controller($scope.$eval($attrs.dynamicController), locals));
                $scope.$on('$destroy', function () {
                    locals.$scope = null;
                    locals.$element = null;
                    locals.$attrs = null;
                    $element.removeData();
                });
            }]
        };
    }

})();
