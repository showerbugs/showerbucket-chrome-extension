(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarFileResource', CalendarFileResource)
        .factory('CalendarEventFileResource', CalendarEventFileResource)
        .factory('CalendarFileApiBiz', CalendarFileApiBiz);

    /* @ngInject */
    function CalendarFileResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/schedules/:scheduleId/files/:fileId', {
            'scheduleId': '@scheduleId',
            'fileId': '@fileId'
        }, {
            'query': {method: 'GET', cancellable: true},
            'save': {method: 'POST'}
        });
    }

    /* @ngInject */
    function CalendarEventFileResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/schedules/:scheduleId/events/:eventId/files/:fileId', {
            'scheduleId': '@scheduleId',
            'eventId': '@eventId',
            'fileId': '@fileId'
        }, {
            'query': {method: 'GET', cancellable: true},
            'save': {method: 'POST'}
        });
    }

    /* @ngInject */
    function CalendarFileApiBiz(CalendarFileResource, CalendarEventFileResource, FileApiInterfaceUtil) {

        return {
            schedule: FileApiInterfaceUtil.createFileService(CalendarFileResource, {
                remove: function (fileId, params) {
                    return !!(fileId && params);
                },
                update: function (fileId, params) {
                    return !!(fileId && params);
                }
            }),
            event: FileApiInterfaceUtil.createFileService(CalendarEventFileResource, {
                remove: function () {
                    throw Error('Don\'t expect access method');
                },
                update: function (fileId, params) {
                    return !!(fileId && params);
                }
            })
        };
    }

})();
