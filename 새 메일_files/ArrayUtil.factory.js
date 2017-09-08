(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('ArrayUtil', ArrayUtil);

    /* @ngInject */
    function ArrayUtil(_) {
        return {
            isEqualEntity: isEqualEntity
        };

        function isEqualEntity(value, other, isDeep) {
            return isDeep ? _(value).xorWith(other, _.isEqual).isEmpty() :
                _(value).xor(other).isEmpty();
        }
    }

})();
