(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .component('calendarListItem', {
            templateUrl: 'modules/calendar/navi/calendarListItem/calendarListItem.html',
            bindings: {
                calendar: '<'
            },
            require: {
                navi: '^^calendarList'
            },
            /* @ngInject */
            controller: function (CalendarDataConverterUtil, CalendarPermissionUtil) {
                var $ctrl = this;
                $ctrl.$onInit = function () {
                    $ctrl.ui = {};
                    $ctrl.ui.write = CalendarPermissionUtil.canCreateSchedule($ctrl.calendar);
                    $ctrl.ui.update = CalendarPermissionUtil.canEnterCalendarSetting($ctrl.calendar);
                    $ctrl.ui.remove = CalendarPermissionUtil.canDeleteCalendar($ctrl.calendar);
                };

                $ctrl.changeColor = function (color) {
                    $ctrl.navi.changeColor($ctrl.calendar.id, color);
                    $ctrl.calendar.color = color;
                    $ctrl.calendar.bgColor = CalendarDataConverterUtil.getBgColor(color);
                    $ctrl.calendar.borderColor = CalendarDataConverterUtil.getBorderColor(color);
                };
            }
        });

})();
