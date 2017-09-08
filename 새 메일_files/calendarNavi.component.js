(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .component('calendarNavi', {
            templateUrl: 'modules/calendar/navi/calendarNavi.html',
            /* @ngInject */
            controller: function (PopupUtil, CalendarRepository) {
                var $ctrl = this;

                $ctrl.openCalendarWritePopup = function () {
                    PopupUtil.openCalendarWritePopup('new', {
                        autoFreebusy: true,
                        calendarId: CalendarRepository.get('status.selectCalendarId')
                        || _(CalendarRepository.get('calendars')).find('checked').id
                    });
                };
            }
        });

})();
