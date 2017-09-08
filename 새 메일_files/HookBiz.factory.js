(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('HookResource', HookResource)
        .factory('HookBiz', HookBiz);

    /* @ngInject */
    function HookResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/hooks/:hookId', {
            projectCode: '@projectCode',
            hookId: '@hookId'
        }, {
            'get': {method: 'GET'},
            'save': {method: 'POST'},
            'update': {method: 'PUT'},
            'remove': {method: 'DELETE'}
        });
    }

    /* @ngInject */
    function HookBiz(API_PAGE_SIZE, HookResource) {
        var HOOK_EVENTS = {
            POST_REGISTERED: 'post_registered',
            COMMENT_REGISTERED: 'comment_registered'
        };

        return {
            HOOK_EVENTS: HOOK_EVENTS,
            fetchList: function (projectCode) {
                var param = _makeHookParam(projectCode);
                param.size = API_PAGE_SIZE.ALL;
                param.page = 0;

                return HookResource.get(param).$promise;
            },
            fetch: function (projectCode, hookId) {
                return HookResource.get(_makeHookParam(projectCode, hookId)).$promise;
            },
            add: function (projectCode, requestBody) {
                return HookResource.save(_makeHookParam(projectCode), [requestBody]).$promise;
            },
            update: function (projectCode, hookId, requestBody) {
                return HookResource.update(_makeHookParam(projectCode, hookId), requestBody).$promise;
            },
            remove: function (projectCode, hookId) {
                return HookResource.remove(_makeHookParam(projectCode, hookId)).$promise;
            }
        };

        function _makeHookParam(projectCode, hookId) {
            return {
                projectCode: projectCode,
                hookId: hookId
            };
        }
    }

})();
