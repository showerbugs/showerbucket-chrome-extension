(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarScheduleResource', CalendarScheduleResource);

    /* @ngInject */
    function CalendarScheduleResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/schedules/:scheduleId', {
            scheduleId: '@scheduleId'
        }, {
            'get': {method: 'GET',  cancellable: true},
            'save': {method: 'POST'},
            'update': {method: 'PUT'},
            'remove': {method: 'DELETE'},
            'setStatus': {method: 'POST', url: ApiConfigUtil.wasContext() + '/schedules/:scheduleId/set-status', cancellable: true}
        });
    }

})();
