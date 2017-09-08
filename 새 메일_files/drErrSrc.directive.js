(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('drErrSrc', DrErrSrc);

    /* @ngInject */
    function DrErrSrc() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('error', function() {
                    element.attr('src', attrs.drErrSrc);
                });
            }
        };
    }

})();
