(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarTempFileResource', CalendarTempFileResource)
        .factory('CalendarFlowTempFileBiz', CalendarFlowTempFileBiz);

    /* @ngInject */
    function CalendarTempFileResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/files/:fileId', {
            'fileId': '@fileId'
        }, {
            'save': {method: 'POST', isArray: true}
        });
    }

    /* @ngInject */
    function CalendarFlowTempFileBiz(ApiConfigUtil, FlowTempFileBizBuilder, CalendarTempFileResource) {
        return new FlowTempFileBizBuilder().withResource(CalendarTempFileResource).withFlowOptions({
            target: ApiConfigUtil.wasContext() + '/files'
        }).build();
    }

})();
