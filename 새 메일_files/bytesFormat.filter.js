(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .filter('bytesFormat', BytesFormat);

    /* @ngInject */
    function BytesFormat(BytesFormatUtil, _) {
        return function (bytes, precision) {
            if (_.isUndefined(bytes)) {
                return bytes;
            }

            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
                return '-';
            }

            var values = BytesFormatUtil.caculateByteCapacityValues(bytes, precision);
            return values.number + ' ' + values.unit;
        };
    }

})();
