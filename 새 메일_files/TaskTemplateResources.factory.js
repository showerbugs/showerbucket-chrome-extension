(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TaskTemplateResource', TaskTemplateResource);

    /* @ngInject */
    function TaskTemplateResource($cacheFactory, $resource, ApiConfigUtil) {
        var cache = $cacheFactory('TaskTemplateResource');
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/templates/:templateId', {
            'projectCode': '@projectCode',
            'templateId': '@templateId'
        }, {
            'get': {method: 'GET', cache: cache},   //params.interpolation
            'save': {method: 'POST'},
            'update': {method: 'PUT'},
            'remove': {method: 'DELETE'},
            'query': {method: 'GET', cache: cache},
            'setOrder': {url: ApiConfigUtil.wasContext() + '/projects/:projectCode/templates/set-order', method: 'POST'}
        });
    }

})();
