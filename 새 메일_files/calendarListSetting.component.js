(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .component('calendarListSetting', {
            templateUrl: 'modules/setting/user/calendar/calendarListSetting/calendarListSetting.html',
            controller: CalendarListSetting,
            bindings: {
                item: '<'
            }
        });

    /* @ngInject */
    function CalendarListSetting($scope, CalendarRepository, CalendarAction, CalendarSettingModal, CalendarTransportModal, RootScopeEventBindHelper) {
        var $ctrl = this;

        RootScopeEventBindHelper.withScope($scope).on(CalendarRepository.EVENTS.CHANGE_STATE, function(e, stateName){
            if(stateName === 'calendars') {
                $ctrl.calendars = _.reject(CalendarRepository.get('calendars'), {type: 'project'});
            }
        });

        this.$onInit = function () {
            CalendarAction.fetchList();
        };

        $ctrl.openCalendarSettingModal = openCalendarSettingModal;
        $ctrl.setListedCalendar = setListedCalendar;
        $ctrl.setAlarmEnabled = setAlarmEnabled;
        $ctrl.importSchedule = importSchedule;
        $ctrl.exportSchedule = exportSchedule;


        function openCalendarSettingModal(calendar) {
            CalendarSettingModal.update(calendar);
        }

        function setListedCalendar(calendar) {
            CalendarAction.setListed(calendar.id, calendar.listed);
        }

        function setAlarmEnabled(calendar) {
            CalendarAction.setAlarmEnabled(calendar.id, calendar.notification.enabled);
        }

        function importSchedule(calendar) {
            CalendarTransportModal.import(calendar);
        }

        function exportSchedule(calendar) {
            CalendarTransportModal.export(calendar);
        }
    }

})();
