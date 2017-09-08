(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('HookLogResource', HookLogResource)
        .factory('HookLogBiz', HookLogBiz);

    /* @ngInject */
    function HookLogResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/hooks/:hookId/logs/:logId', {
            projectCode: '@projectCode',
            hookId: '@hookId',
            logId: '@logId'
        }, {
            'get': {method: 'GET'},
            'update': {method: 'PUT'},
            'resend': {method: 'POST', url: ApiConfigUtil.wasContext() + '/projects/:projectCode/hooks/:hookId/logs/:logId/resend'}
        });
    }

    /* @ngInject */
    function HookLogBiz(HookLogResource) {

        return {
            fetchList: function (projectCode, hookId) {
                var param = _makeHookLogParam(projectCode, hookId);
                param.size = 50;
                param.page = 0;
                return HookLogResource.get(param).$promise;
            },
            fetch: function (projectCode, hookId, logId) {
                return HookLogResource.get(_makeHookLogParam(projectCode, hookId, logId)).$promise;
            },
            update: function (projectCode, hookId, logId, requestBody) {
                return HookLogResource.update(_makeHookLogParam(projectCode, hookId, logId), requestBody).$promise;
            },
            resend: function (projectCode, hookId, logId) {
                return HookLogResource.resend(_makeHookLogParam(projectCode, hookId, logId)).$promise;
            }
        };

        function _makeHookLogParam(projectCode, hookId, logId) {
            return {
                projectCode: projectCode,
                hookId: hookId,
                logId: logId
            };
        }
    }

})();
