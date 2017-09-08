/**
 * @ngdoc overview
 * @name doorayWebApp.calendar
 * @description
 * # doorayWebApp.calendar
 *
 * Config module of the application.
 */

(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .constant('DOORAY_CALENDAR_COLORS', [
            '#da1b1b', '#d36255', '#e07215', '#b99800',
            '#f8cf14', '#1335ac', '#1bb0b0', '#4091d0',
            '#c41298', '#d85c82', '#b857d8', '#887cda',
            '#43ba03', '#90dc36', '#333333', '#666666'
        ])
        .run(runInitalizeDoorayCalendar);

    /* @ngInject */
    function runInitalizeDoorayCalendar($rootScope, DOORAY_LAZYLOAD_EVENTS, HelperConfigUtil, moment) {
        var timezoneName = HelperConfigUtil.timezone() || moment.tz.guess();

        var unbindHandler = $rootScope.$on(DOORAY_LAZYLOAD_EVENTS.DOORAY_CALENDAR, function (e, DoorayCalendar) {
            unbindHandler();
            DoorayCalendar.setTimezoneOffset(moment.tz.zone(timezoneName).offset(moment()));
        });


    }

})();
