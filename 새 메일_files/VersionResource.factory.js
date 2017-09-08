(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('VersionResource', VersionResource);

    /* @ngInject */
    function VersionResource($resource) {
        return $resource('/statics/version.json', {
            'timestamp': '@timestamp'
        }, {
            'get': {method: 'GET', ignore: { isSuccessfulFalsy: true }}
        });
    }

})();
