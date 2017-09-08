(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarResource', CalendarResource);

    /* @ngInject */
    function CalendarResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/calendars/:calendarId', {
            'calendarId': '@calendarId'
        }, {
            'get': {method: 'GET', cancellable: true},
            'save': {method: 'POST'},
            'update': {method: 'PUT'},
            'delete': {method: 'DELETE'},
            'freebusy': {method: 'GET', url:  ApiConfigUtil.wasContext() + '/freebusy'},
            'setColor': {method: 'POST', url:  ApiConfigUtil.wasContext() + '/calendars/:calendarId/set-color'},
            'setListed': {method: 'POST', url:  ApiConfigUtil.wasContext() + '/calendars/:calendarId/set-listed'},
            'setChecked': {method: 'POST', url:  ApiConfigUtil.wasContext() + '/calendars/:calendarId/set-checked'},
            'setAlarmEnabled':  {method: 'POST', url:  ApiConfigUtil.wasContext() + '/calendars/:calendarId/set-notification'}
        });
    }

})();
