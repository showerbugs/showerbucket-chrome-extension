(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .filter('fixedFormat', FixedFormat);

    /* @ngInject */
    function FixedFormat($window) {
        return function (input, precision) {
            return $window.isNaN(input * 1) ? '0' : (input * 1).toFixed(precision || 0);
        };
    }

})();
