(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TaskAnnotationResource', TaskAnnotationResource)
        .factory('MarkTaskImportantBiz', MarkTaskImportantBiz);

    /* @ngInject */
    function TaskAnnotationResource($resource, API_ERROR_CODE, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/posts/:postNumber/annotations', {
            'projectCode': '@projectCode',
            'postNumber': '@postNumber'
        }, {
            'save': {method: 'PUT', ignore: {resultCode: [API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED, API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED]}}
        });
    }

    /* @ngInject */
    function MarkTaskImportantBiz(TaskAnnotationResource) {
        return {
            toggleFavorite : function(post){
                var _query = {
                    'projectCode': post.projectCode,
                    'postNumber': post.number ,
                    'favorited': !post.annotations.favorited
                };
                return TaskAnnotationResource.save(_query).$promise;
            }
        };
    }

})();
