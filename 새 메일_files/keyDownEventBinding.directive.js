(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('keyDownEventBinding', keyDownEventBinding);

    /* @ngInject */
    function keyDownEventBinding(_) {
        return {
            restrict: 'A',
            scope: {
                keyDownEventBinding: '=', // ex: {key number: Function or null(targetAction)}
                preventEventFlags: '=?'
            },
            link: function (scope, element) {
                var keys = _.map(_.keys(scope.keyDownEventBinding), function (key) { return +key; });
                scope.preventEventFlags = scope.preventEventFlags ? scope.preventEventFlags : { preventDefault: true, stopPropagation: true};

                var preventDefaultKeyEvent = function (event) {
                    var targetEvent = scope.keyDownEventBinding[event.which];
                    if (keys.indexOf(event.which) < 0) {
                        return;
                    }

                    if (scope.preventEventFlags.preventDefault) {
                        event.preventDefault();
                    }

                    if (scope.preventEventFlags.stopPropagation) {
                        event.stopPropagation();
                    }

                    if (_.isFunction(targetEvent)) {
                        targetEvent();
                    }
                };
                element.on('keydown', preventDefaultKeyEvent);

                scope.$on('$destroy', function () {
                    element.off('keydown', preventDefaultKeyEvent);
                });
            }
        };
    }

})();
