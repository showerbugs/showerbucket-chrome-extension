(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('IdProviderResource', IdProviderResource)
        .factory('IdProviderBiz', IdProviderBiz);

    /* @ngInject */
    function IdProviderResource($resource, $cacheFactory, ApiConfigUtil) {
        var cache = $cacheFactory('IdProviderResource');
        return $resource(ApiConfigUtil.wasContext() + '/id-providers' , {}, {
            'get': {method: 'GET', cache: cache}
        });
    }

    /* @ngInject */
    function IdProviderBiz(IdProviderResource) {
        return {
            fetch: function () {
                return IdProviderResource.get().$promise;
            }
        };
    }

})();
