/**
 * https://gist.github.com/EpokK/5884263
 */
(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .directive('keyEnter', KeyEnter);

    /* @ngInject */
    function KeyEnter($parse, _) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var keyEnterExp = $parse(attrs.keyEnter);
                var keyEnterOptions = _.assign({
                    preventDefault: true,
                    stopPropagation: false,
                    stopImmediatePropagation: false
                }, $parse(attrs.keyEnterOptions)(scope));

                var target$  = element.find(keyEnterOptions.target);
                target$ = _.isEmpty(target$) ? element : target$;
                target$.bind('keydown keypress', function (event) {
                    if (event.which === 13) {
                        scope.$apply(function () {
                            keyEnterExp(scope);
                        });
                        if (keyEnterOptions.preventDefault) {
                            event.preventDefault();
                        }
                        if (keyEnterOptions.stopPropagation) {
                            event.stopPropagation();
                        }
                        if (keyEnterOptions.stopImmediatePropagation) {
                            event.stopImmediatePropagation();
                        }
                    }
                });
            }
        };
    }

})();
