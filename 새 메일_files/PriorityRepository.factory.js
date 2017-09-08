(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('PriorityResource', PriorityResource)
        .factory('PriorityRepository', PriorityRepository);

    /* @ngInject */
    function PriorityResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/settings/priority', {
            projectCode: '@projectCode'
        }, {
            get: {method: 'GET'},
            update: {method: 'PUT'}
        });
    }

    /* @ngInject */
    function PriorityRepository(PriorityResource) {
        var paramCache = {},
            contentsMap = [],
            promise = null;

        return {
            fetchAndCache: fetchAndCache,
            getModel: getModel,
            getCurrentParam: getCurrentParam,
            update: update
        };

        function fetchAndCache(param) {
            promise = PriorityResource.get(param);
            return promise.$promise.then(function (res) {
                paramCache = param;
                contentsMap = res.contents();
                return contentsMap;
            });
        }

        function getModel() {
            return contentsMap;
        }

        function getCurrentParam() {
            return paramCache;
        }

        function update(projectCode, body) {
            return PriorityResource.update({projectCode: projectCode}, body).$promise;
        }
    }

})();
