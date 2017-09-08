(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .filter('htmlunsafe', Htmlunsafe);

    /* @ngInject */
    function Htmlunsafe($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        };
    }

})();
