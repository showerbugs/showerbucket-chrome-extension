(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TaskReadResource', TaskReadResource)
        .factory('TaskUnreadResource', TaskUnreadResource)
        .factory('MarkTaskReadBiz', MarkTaskReadBiz);

    /* @ngInject */
    function TaskReadResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/*/posts/read', {
        }, {
            'set': {method: 'post'}
        });
    }

    /* @ngInject */
    function TaskUnreadResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/*/posts/unread', {
        }, {
            'set': {method: 'post'}
        });
    }

    /* @ngInject */
    function MarkTaskReadBiz(TaskReadResource, TaskUnreadResource) {
        return {
            setRead : function(params){
                return TaskReadResource.set(params);
            },
            setUnread : function(params){
                return TaskUnreadResource.set(params);
            }

        };
    }

})();
