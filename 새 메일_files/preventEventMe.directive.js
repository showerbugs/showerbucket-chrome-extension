(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('preventEventMe', PreventEventMe);

    /* @ngInject */
    function PreventEventMe() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.on(attrs.preventEventMe, function (event) {
                    event[attrs.preventEventName]();
                });

                scope.$on('$destroy', function () {
                    element.off(attrs.preventEventMe);
                });
            }
        };
    }

})();
