(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .filter('commonDateTime', CommonDateTime);

    /* @ngInject */
    function CommonDateTime(DateConvertUtil) {
        return function (input) {
            return DateConvertUtil.convertDateTimeInView(input);
        };
    }

})();
