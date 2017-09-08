(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .factory('BytesFormatUtil', BytesFormatUtil);

    /* @ngInject */
    function BytesFormatUtil(_) {
        var UNIT_VALUES = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

        return {
            UNIT_VALUES: _.keyBy(UNIT_VALUES),
            caculateBytesFromNumberWithUnit: caculateBytesFromNumberWithUnit,
            caculateByteCapacityByUnit: caculateByteCapacityByUnit,
            caculateByteCapacityValues: caculateByteCapacityValues
        };

        function caculateBytesFromNumberWithUnit(number, unit) {
            var unitIndex = _.indexOf(UNIT_VALUES, unit);
            return Math.pow(1024, unitIndex) * number;
        }

        //UNIT 기준에 맞게 bytes를 해당 단위로 재계산함
        function caculateByteCapacityByUnit(bytes, precision, unit) {
            var adjustUnitIndex = _findUnitIndexByBytes(bytes);
            var unitIndex = _.indexOf(UNIT_VALUES, unit);
            if (adjustUnitIndex === unitIndex) {
                return caculateByteCapacityValues(bytes, precision);
            }

            return _formatObjectByUnitIndex(bytes, precision, unitIndex);
        }

        function caculateByteCapacityValues(bytes, precision) {
            if (_.isUndefined(bytes)) {
                return bytes;
            }
            precision = (_.isUndefined(precision)) ? 1 : precision;
            var unitIndex = _findUnitIndexByBytes(bytes);
            return _formatObjectByUnitIndex(bytes, precision, unitIndex);
        }

        function _findUnitIndexByBytes(bytes) {
            return bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(1024)) : 0;
        }

        function _formatObjectByUnitIndex(bytes, precision, unitIndex) {
            return {
                number: bytes > 0 ? Number((bytes / Math.pow(1024, Math.floor(unitIndex))).toFixed(precision)) : 0,
                unit: UNIT_VALUES[unitIndex]
            };
        }
    }

})();
