(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('SubPostResource', SubPostResource);

    /* @ngInject */
    function SubPostResource($resource, API_ERROR_CODE, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/posts/:postNumber/sub-posts',
            {
                'projectCode': '@projectCode',
                'postNumber': '@postNumber'
            },
            {
                'get': {'method': 'GET', cancellable: true, ignore: {resultCode: [API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED, API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED]}}
            });
    }

})();
