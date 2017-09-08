(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('SharedLinkResource', SharedLinkResource)
        .factory('SharedLinkBiz', SharedLinkBiz);

    /* @ngInject */
    function SharedLinkResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/posts/:postNumber/shared-links/:sharedLinkId', {
            'projectCode': '@projectCode',
            'postNumber': '@postNumber',
            'sharedLinkId': '@sharedLinkId'
        }, {
            'save': {method: 'POST'},
            'get': {method: 'GET'},
            'update': {method: 'PUT'},
            'remove': {method: 'DELETE'}
        });
    }

    /* @ngInject */
    function SharedLinkBiz(API_PAGE_SIZE, SharedLinkResource) {
        return {
            fetchList: function (params) {
                params = params || {};
                params.projectCode = params.projectCode || '*';
                params.postNumber = params.postNumber || '*';
                params.page = params.page || 0;
                params.size = params.size || API_PAGE_SIZE.ALL;

                return SharedLinkResource.get(params).$promise;
            },
            add: function (params, requestBody) {
                return SharedLinkResource.save(params, [requestBody]).$promise;
            },
            update: function (params, requestBody) {
                return SharedLinkResource.update(params, requestBody).$promise;
            },
            remove: function (params) {
                return SharedLinkResource.remove(params).$promise;
            }
        };
    }

})();
