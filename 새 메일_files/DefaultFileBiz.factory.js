(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('DefaultFileBiz', DefaultFileBiz)
        .factory('DefaultFileResource', DefaultFileResource);

    /* @ngInject */
    function DefaultFileResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/files/:fileId', {
            'fileId': '@fileId'
        }, {
            'save': {method: 'POST'}
        });
    }

    /* @ngInject */
    function DefaultFileBiz(ApiConfigUtil, FlowTempFileBizBuilder, DefaultFileResource) {
        return new FlowTempFileBizBuilder().withResource(DefaultFileResource).withFlowOptions({
            target: ApiConfigUtil.wasContext() + '/files'
        }).build();
    }

})();
