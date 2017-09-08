(function () {

    'use strict';

    angular
        .module('doorayWebApp.stream')
        .factory('StreamListResource', StreamListResource);

    /* @ngInject */
    function StreamListResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/streams', {
        }, {
            'get': {method: 'GET', cancellable: true},
            'save': {method: 'POST', isArray: true},
            'update': {method: 'PUT'},
            'remove': {method: 'DELETE'},
            'read': {
                url: ApiConfigUtil.wasContext() + '/streams/read',
                method: 'POST'
            }
        });
    }

})();
