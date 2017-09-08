(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .directive('shortcut', Shortcut);

    /* @ngInject */
    function Shortcut(Mousetrap, _) {
        return {
            restrict: 'A',
            link: function postLink(scope, element, attrs) {
                var mousetrap = Mousetrap(element[0]);
                var shortcut = scope.$eval(attrs.shortcut); // isolate scope이 곂치는 것을 방지하지 위하여 attr 사용

                _.forIn(shortcut, function (handler, combo) {
                    mousetrap.bind(combo, function () {
                        var args = Array.prototype.slice.call(arguments);
                        scope.$apply(function () {
                            handler.apply(null, args);
                        });
                    });
                });

                scope.$on('$destroy', function () {
                    _.forIn(shortcut, function (handler, combo) {
                        mousetrap.unbind(combo);
                    });
                });
            }
        };
    }

})();
