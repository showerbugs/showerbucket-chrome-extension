(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('CountResource', CountResource);

    /* @ngInject */
    function CountResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/members/me/counts/:service', {
            'service': '@service'
        }, {
            'get': {method: 'GET', cancellable: true, ignore: {responseError: true}}
        });
    }

})();
