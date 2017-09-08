(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .factory('TenantResource', TenantResource)
        .factory('TenantRepository', TenantRepository);

    /* @ngInject */
    function TenantResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() , {}, {
            'get': { method: 'GET'},
            'update': { method: 'PUT'}
        });
    }

    /* @ngInject */
    function TenantRepository(HelperPromiseUtil, TenantResource) {
        var viewModel = {},
            promise = null;

        return {
            fetchAndCache: fetchAndCache,
            getOrFetch: getOrFetch,
            update: update,
            getModel: getModel
        };

        function fetchAndCache() {
            HelperPromiseUtil.cancelResource(promise);
            promise = TenantResource.get();
            return promise.$promise.then(function (res) {
                viewModel = res.contents();
            });
        }

        function getOrFetch() {
            return _.get(promise, '$promise', fetchAndCache());
        }

        function update(param) {
            return TenantResource.update(param).$promise;
        }

        function getModel() {
            return viewModel;
        }
    }

})();
