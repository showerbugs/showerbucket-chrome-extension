(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('MentionResource', MentionResource);

    /* @ngInject */
    function MentionResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/mentions', {}, {
            'save': {method: 'POST'},
            'update': {method: 'PUT'},
            'remove': {method: 'DELETE'},
            'get': {method: 'GET', cancellable: true}
        });
    }

})();
