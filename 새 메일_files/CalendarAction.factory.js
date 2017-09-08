(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarAction', CalendarAction);

    /* @ngInject */
    function CalendarAction(CalendarResource, CalendarRepository, CalendarScheduleAction, CalendarDataConverterUtil, HelperPromiseUtil) {
        var fetchCalendarsPromise;
        return {
            fetch: fetch,
            fetchList: fetchList,
            save: save,
            update: update,
            remove: remove,
            setColor: setColor,
            setListed: setListed,
            setChecked: setChecked,
            setAlarmEnabled: setAlarmEnabled
        };

        function fetch(param) {
            return CalendarResource.get(param).$promise.then(function (result) {
                return CalendarDataConverterUtil.setCalendarProp(result.contents());
            });
        }

        function fetchList() {
            HelperPromiseUtil.cancelResource(fetchCalendarsPromise);
            fetchCalendarsPromise = CalendarResource.get();
            return fetchCalendarsPromise.$promise.then(function (result) {
                CalendarRepository.commit('SET_CALENDARS', result.contents());
                CalendarScheduleAction.fetchList();
            });
        }

        function save(param) {
            return CalendarResource.save([param]).$promise.then(function (result) {
                fetchList();
                return result;
            });
        }

        function update(calendarId, param) {
            return CalendarResource.update({calendarId: calendarId}, param).$promise.then(function (result) {
                fetchList();
                return result;
            });
        }

        function remove(calendarId) {
            return CalendarResource.delete({calendarId: calendarId}).$promise.then(function (result) {
                fetchList();
                return result;
            });
        }

        function setColor(calendarId, color) {
            return CalendarResource.setColor({calendarId: calendarId},
                {color: color}).$promise.then(function (result) {
                    fetchList();
                    return result;
                });
        }

        function setListed(calendarId, listed) {
            return CalendarResource.setListed({calendarId: calendarId},
                {listed: listed}).$promise.then(function (result) {
                    fetchList();
                    return result;
                });
        }

        function setChecked(calendarId, checked) {
            return CalendarResource.setChecked({calendarId: calendarId},
                {checked: checked}).$promise.then(function (result) {
                    fetchList();
                    return result;
            });
        }

        function setAlarmEnabled(calendarId, enabled) {
            return CalendarResource.setAlarmEnabled({calendarId: calendarId},
                {active: enabled}).$promise.then(function (result) {
                    fetchList();
                    return result;
                });
        }
    }

})();
