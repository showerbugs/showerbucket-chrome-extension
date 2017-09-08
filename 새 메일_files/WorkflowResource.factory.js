(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('WorkflowResource', WorkflowResource);

    /* @ngInject */
    function WorkflowResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/workflows', {
            'projectCode': '@projectCode'
        }, {
            'save': {method: 'POST', isArray: true},
            'update': {method: 'PUT'}
        });
    }

})();
