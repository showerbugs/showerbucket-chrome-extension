(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarScheduleApiBiz', CalendarScheduleApiBiz);


    /* @ngInject */
    function CalendarScheduleApiBiz(CalendarScheduleResource, HelperPromiseUtil) {

        var fetchSchedulesPromise = null;

        return {
            fetch: fetch,
            fetchList: fetchList,
            update: update,
            remove: remove,
            setStatus: setStatus
        };

        function fetch(scheduleId) {
            return CalendarScheduleResource.get({
                scheduleId: scheduleId
            }).$promise;
        }

        function fetchList(param, cancelResource) {
            var promise = CalendarScheduleResource.get(param);
            if(cancelResource) {
                HelperPromiseUtil.cancelResource(fetchSchedulesPromise);
                fetchSchedulesPromise = promise;
            }
            return promise.$promise;
        }

        function update (scheduleId, param) {
            return CalendarScheduleResource.update({
                scheduleId: scheduleId,
                updateType: param.updateType || null
            }, param).$promise;
        }

        function remove(scheduleId, deleteType) {
            return CalendarScheduleResource.remove({
                scheduleId: scheduleId,
                deleteType: deleteType || 'this'
            }).$promise;
        }

        function setStatus(scheduleId, status){
            return CalendarScheduleResource.setStatus({
                scheduleId: scheduleId,
                status: status  /* accepted | declined | tentativ | not_confirmed */
            }).$promise;
        }
    }

})();
