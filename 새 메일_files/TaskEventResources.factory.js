(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TaskEventResource', TaskEventResource)
        .factory('TaskEventFileResource', TaskEventFileResource);

    /* @ngInject */
    function TaskEventResource($resource, API_ERROR_CODE, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/posts/:postNumber/events/:eventId', {
            'projectCode': '@projectCode',
            'postNumber': '@postNumber',
            'eventId': '@eventId'
        }, {
            'save': {method: 'POST', ignore: {isSuccessfulFalsy: true, resultCode: [API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED, API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED]}},
            'update': {method: 'PUT', ignore: {isSuccessfulFalsy: true, resultCode: [API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED, API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED]}},
            'remove': {method: 'DELETE', ignore: {isSuccessfulFalsy: true, resultCode: [API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED, API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED]}},
            'get': {method: 'GET', cancellable: true, ignore: {resultCode: [API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED, API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED]}}
        });
    }

    /* @ngInject */
    function TaskEventFileResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/posts/:postNumber/events/:eventId/files/:fileId', {
            'projectCode': '@projectCode',
            'postNumber': '@postNumber',
            'eventId': '@eventId',
            'fileId': '@fileId'
        }, {
            'save': {method: 'POST'}
        });
    }

})();
