(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TagResource', TagResource)
        .factory('ModifyTagResource', ModifyTagResource)
        .factory('ModifyTagPrefixResource', ModifyTagPrefixResource);

    /* @ngInject */
    function TagResource($cacheFactory, $resource, ApiConfigUtil, API_ERROR_CODE) {
        var cache = $cacheFactory('TagResource');
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/tags/:tagId', {
            'projectCode': '@projectCode',
            'tagId': '@tagId'
        }, {
            'get': {method: 'GET', cache: cache},
            'getWithoutCache': {method: 'GET'},
            'save': {method: 'POST'},
            'update': {method: 'PUT'},
            'remove': {method: 'DELETE', ignore: {resultCode: API_ERROR_CODE.SERVER_PROJECT_TAG_IN_USE}}
        });
    }

    /* @ngInject */
    function ModifyTagResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/posts/modify-tags', {
            'projectCode': '@projectCode'
        }, {
            'save': {method: 'POST'}
        });
    }

    /* @ngInject */
    function ModifyTagPrefixResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/tag-prefixes/:tagPrefixId', {
            'projectCode': '@projectCode',
            'tagPrefixId': '@tagPrefixId'
        }, {
            'update': {method: 'PUT'}
        });
    }

})();
