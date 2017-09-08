(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('focusOnDropdown', FocusOnDropdown);

    /* @ngInject */
    function FocusOnDropdown($timeout) {
        return {
            restrict: 'A',
            scope: {},
            link: function (scope, element) {
                element.on('click', onClick);

                scope.$on('$destroy', function () {
                    element.off('click', onClick);
                });

                function onClick() {
                    $timeout(function () {
                        var firstDropdownEl$ = angular.element(element.parent().find('.dropdown-menu button:first,.dropdown-menu input:first,.dropdown-menu a:first')[0]);
                        if (firstDropdownEl$.length > 0) {
                            firstDropdownEl$.focus();
                        }
                    }, 0, false);
                }
            }
        };
    }

})();
