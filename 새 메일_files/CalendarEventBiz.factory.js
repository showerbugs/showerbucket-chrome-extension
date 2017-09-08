(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarEventBiz', CalendarEventBiz)
        .factory('CalendarEventResource', CalendarEventResource)
        .factory('CalendarEventFileResource', CalendarEventFileResource);

    /* @ngInject */
    function CalendarEventResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/schedules/:scheduleId/events/:eventId', {
            scheduleId: '@scheduleId',
            eventId: '@eventId'
        }, {
            'save': {method: 'POST', ignore: {isSuccessfulFalsy: true}},
            'update': {method: 'PUT', ignore: {isSuccessfulFalsy: true}},
            'remove': {method: 'DELETE', ignore: {isSuccessfulFalsy: true}},
            'get': {method: 'GET', cancellable: true}
        });
    }

    /* @ngInject */
    function CalendarEventFileResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/schedules/:scheduleId/events/:eventId/files/:fileId', {
            scheduleId: '@scheduleId',
            eventId: '@eventId',
            fileId: '@fileId'
        }, {
            'save': {method: 'POST'}
        });
    }

    /* @ngInject */
    function CalendarEventBiz(CalendarEventResource) {
        return {
            /*params: {
             projectCode
             postNumber
             postId
             type
             files
             contents
             }*/
            save: function (params) {
                var pathParams = {
                    scheduleId: params.scheduleId
                };

                return CalendarEventResource.save(pathParams, [params]).$promise.then(function(result) {
                    return result.result()[0];
                });
            },

            /*params: {
             projectCode
             postNumber
             eventId
             }*/
            remove: function (params) {
                return CalendarEventResource.remove(params).$promise;
            },
            update: function(params){
                return CalendarEventResource.update(params).$promise;
            }
        };
    }

})();
