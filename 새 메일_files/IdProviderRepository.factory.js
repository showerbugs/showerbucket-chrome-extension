(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .factory('IdProviderResource', IdProviderResource)
        .factory('IdProviderRepository', IdProviderRepository);

    /* @ngInject */
    function IdProviderResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/id-providers', {}, {
            'get': { method: 'GET'}
        });
    }

    /* @ngInject */
    function IdProviderRepository(IdProviderResource) {
        var viewModel = {},
            promise = null;

        return {
            getOrFetchPromise: getOrFetchPromise,
            getModel: getModel
        };

        function getOrFetchPromise() {
            return _.get(promise, '$promise') || _fetchAndCache();
        }

        function _fetchAndCache() {
            promise = IdProviderResource.get();
            return promise.$promise.then(function (res) {
                viewModel = res.contents();
            });
        }

        function getModel() {
            return viewModel;
        }
    }

})();
