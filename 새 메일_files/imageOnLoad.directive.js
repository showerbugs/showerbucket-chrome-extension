(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('imageOnLoad', ImageOnLoad);

    /* @ngInject */
    function ImageOnLoad($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var fn = $parse(attrs.imageOnLoad);
                element.on('load error', function (event) {
                    element.off('load error');
                    scope.$apply(function () {
                        fn(scope, {$event: event});
                    });
                });

                scope.$on('$destroy', function () {
                    element.off('load error');
                });
            }
        };
    }

})();
