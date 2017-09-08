(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('ProjectNoticeResource', ProjectNoticeResource)
        .factory('ProjectNoticeBiz', ProjectNoticeBiz);

    /* @ngInject */
    function ProjectNoticeResource($resource, API_ERROR_CODE, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/posts/:postNumber/pin', {
            'projectCode': '@projectCode',
            'postNumber': '@postNumber'
        }, {
            'save': {method: 'POST', ignore: {resultCode: [API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED, API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED]}},
            'remove': {
                'url': ApiConfigUtil.wasContext() + '/projects/:projectCode/posts/:postNumber/unpin',
                method: 'POST'
            }
        });
    }

    /* @ngInject */
    function ProjectNoticeBiz(ProjectNoticeResource) {
        return {
            notice: notice,
            remove: remove
        };

        function notice(projectCode, postNumber) {
            return ProjectNoticeResource.save({projectCode: projectCode, postNumber: postNumber}).$promise;
        }

        function remove(projectCode, postNumber) {
            return ProjectNoticeResource.remove({projectCode: projectCode, postNumber: postNumber}).$promise;
        }
    }

})();
