(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .filter('relativeDate', RelativeDate);

    /* @ngInject */
    function RelativeDate(moment, gettextCatalog) {
        return function (input, dueDateFlag) {
            var now, today, date, time;

            //없음
            if (!dueDateFlag) {
                return gettextCatalog.getString('없음');
            // 미정
            } else if (!input) {
                return gettextCatalog.getString('미정');
            }

            now = moment();
            today = moment().startOf('day');
            date = moment(input).startOf('day');
            time = moment(input);

            // today
            if (date.isSame(today)) {
                return time.isBefore(now) ?
                    ('H +' + now.diff(time, 'hours')) :
                    ('H -' + time.diff(now, 'hours'));
            }
            return date.isBefore(today) ?
                ('D+' + _calcDiffDays(today, date)) :
                ('D-' + _calcDiffDays(date, today));
        };

        function _calcDiffDays(value, other) {
            return Math.min(999, value.diff(other, 'days'));
        }
    }

})();
