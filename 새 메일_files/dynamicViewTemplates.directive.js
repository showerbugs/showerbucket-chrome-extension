(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('dynamicViewTemplates', DynamicViewTemplates);

    /* @ngInject */
    function DynamicViewTemplates($compile, $templateCache, EMIT_EVENTS, _) {
        return {
            restrict: "A",
            scope: {
                dynamicViewTemplates: '=',
                replace: '@'
            },
            link: function (scope, element, attrs) {
                var replace = angular.fromJson(scope.replace),
                    prevDom$;

                var detachWatch = scope.$watch('dynamicViewTemplates', function (val) {
                    if (!val) {
                        return;
                    }
                    if (_.startsWith(attrs.dynamicViewTemplates, '::')) {
                        detachWatch();
                    }

                    var parent$ = replace ? element.parent() : element;
                    prevDom$ && prevDom$.remove();
                    prevDom$ = $compile($templateCache.get(val))(scope.$parent);
                    if (parent$ !== element) {
                        element.remove();
                    }
                    parent$.html(prevDom$);
                    scope.$emit(EMIT_EVENTS.CUSTOM_DOM_RENDERED);
                });

                scope.$on('$destroy', function () {
                    detachWatch();
                });
            }
        };
    }

})();
