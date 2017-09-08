(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TaskToResource', TaskToResource);

    /* @ngInject */
    function TaskToResource($resource, API_ERROR_CODE, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/posts/:postNumber/to/:target', {
                'projectCode': '@projectCode',
                'postNumber': '@postNumber',
                'target': '@target'
            },
            {
                'save': {method: 'POST', isArray: true},
                'update': {method: 'PUT', ignore: {resultCode: [API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED, API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED]}}
            });
    }

})();
