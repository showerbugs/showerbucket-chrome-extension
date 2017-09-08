(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('PolarisPathResource', PolarisPathResource)
        .factory('PolarisStatusResource', PolarisStatusResource)
        .factory('PolarisFileBiz', PolarisFileBiz);

    /* @ngInject */
    function PolarisPathResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/files/:fileId/generate-polaris-download-path', {
            fileId: '@fileId'
        }, {
            'make': { method: 'POST'}
        });
    }

    /* @ngInject */
    function PolarisStatusResource($resource, ApiConfigUtil) {
        return {
            get: function (params) {
                return $resource(ApiConfigUtil.wasContext() + params.url + '/status').get();
            }
        };
    }

    /* @ngInject */
    function PolarisFileBiz(PolarisStatusResource, PolarisPathResource) {
        return {
            makePath: function (params) {
                return PolarisPathResource.make(params).$promise;
            },
            confirmFileStatus: function (url) {
                return PolarisStatusResource.get({url: url}).$promise;
            }
        };
    }

})();
