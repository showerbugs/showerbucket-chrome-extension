(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('LogResource', LogResource);

    /* @ngInject */
    function LogResource($resource, API_CONFIG) {
        return $resource(API_CONFIG.wastaskcontext + '/search/es/log');
    }

})();
