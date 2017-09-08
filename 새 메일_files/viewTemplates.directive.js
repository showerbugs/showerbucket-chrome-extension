(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('viewTemplates', ViewTemplates);

    /* @ngInject */
    function ViewTemplates($parse, $templateCache, EMIT_EVENTS) {
        return {
            restrict: 'EA',
            //priority: 400,
            //terminal: true,
            //transclude: 'element',
            template: function (element, attrs) {
                return $templateCache.get($parse(attrs.src || attrs.viewTemplates)());
            },
            //templateUrl: function (element, attrs) {
            //    return $parse(attrs.src || attrs.viewTemplates)();
            //},
            compile: function (element, attr) {
                var onloadExp = $parse(attr.onload || '');
                return function (scope/*, $element, $attr, ctrl, $transclude*/) {
                    onloadExp(scope);
                    scope.$emit(EMIT_EVENTS.CUSTOM_DOM_RENDERED);
                };
            }
        };
    };

})();
