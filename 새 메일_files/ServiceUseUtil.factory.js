(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('ServiceUseUtil', ServiceUseUtil);

    /* @ngInject */
    function ServiceUseUtil(HelperConfigUtil, _) {
        return {
            getUseServiceNames: getUseServiceNames
        };

        function getUseServiceNames() {
            return _(HelperConfigUtil.serviceUse())
                .map(function (val, key) {
                    return val && key;
                })
                .filter().value();
        }
    }

})();
