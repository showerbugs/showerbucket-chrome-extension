(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .filter('simpleFormatDate', SimpleFormatDate);

    /* @ngInject */
    function SimpleFormatDate(moment) {
        var FULL_FORMAT = 'YYYY.MM.DD HH:mm',
            today = moment();

        return function (input) {
            var inputDate = moment(input);

            if (today.isSame(input, 'day')) { //오늘 보낸 태스크,메시지
                return {
                    full: inputDate.format(FULL_FORMAT),
                    day: '',
                    time: inputDate.format('HH:mm')
                };
            } else {
                return {
                    full: inputDate.format(FULL_FORMAT),
                    day: inputDate.format('YYYY.MM.DD'),
                    time: ''
                };
            }
        };
    }

})();
