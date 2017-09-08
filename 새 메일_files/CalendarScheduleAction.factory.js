(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarScheduleAction', CalendarScheduleAction);

    /* @ngInject */
    function CalendarScheduleAction(CalendarScheduleResource, CalendarRepository, DateConvertUtil, HelperPromiseUtil, _) {

        var fetchSchedulesPromise = null,
            setStatusPromise = null;

        return {
            fetch: fetch,
            fetchList: fetchList,
            save: save,
            update: update,
            remove: remove,
            setStatus: setStatus
        };

        function fetch(scheduleId) {
            return CalendarScheduleResource.get({
                scheduleId: scheduleId
            }).$promise;
        }

        function fetchList() {
            var param = makeFetchListParam();
            HelperPromiseUtil.cancelResource(fetchSchedulesPromise);
            if(!param.calendars || !DateConvertUtil.isValidDate(param.timeMin) || !DateConvertUtil.isValidDate(param.timeMax)) {
                CalendarRepository.commit('SET_SCHEDULES', []);
                return;
            }
            fetchSchedulesPromise = CalendarScheduleResource.get(param);
            fetchSchedulesPromise.$promise.then(function(result) {
                CalendarRepository.commit('SET_SCHEDULES', result.contents());
            });
        }


        function update (scheduleId, param) {
            return CalendarScheduleResource.update({
                scheduleId: scheduleId,
                updateType: param.updateType || null
            }, param).$promise.then(function(result) {
                    fetchList();
                    return result;
                });
        }

        function save (form) {
            return CalendarScheduleResource.save([form]).$promise.then(function(result) {
                fetchList();
                return result;
            });
        }

        function remove(scheduleId, deleteType) {
            return CalendarScheduleResource.remove({
                scheduleId: scheduleId,
                deleteType: deleteType
            }).$promise.then(function(result) {
                fetchList();
                return result;
            });
        }

        function setStatus(scheduleId, status) {
            HelperPromiseUtil.cancelResource(setStatusPromise);
            setStatusPromise = CalendarScheduleResource.setStatus({
                scheduleId: scheduleId,
                status: status  /* accepted | declined | tentativ | not_confirmed */
            });
            return setStatusPromise.$promise;
        }

        function makeFetchListParam () {
            var status = CalendarRepository.get('status'),
                mnTimeMin = moment(status.startDate),
                mnTimeMax = moment(status.endDate),
                calendars = status.selectCalendarId || _(CalendarRepository.get('calendars')).filter('listed').filter('checked').map('id').value().join(',');

            return {
                timeMin: mnTimeMin.isValid() ? mnTimeMin.startOf('date').format() : status.startDate,
                timeMax: mnTimeMax.isValid() ? mnTimeMax.endOf('date').format() : status.endDate,
                calendars: calendars,
                postType: status.postType
            };
        }
    }

})();
