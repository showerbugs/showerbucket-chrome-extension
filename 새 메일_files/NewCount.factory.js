(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('NewCount', NewCount);


    /* @ngInject */
    function NewCount(CountResource) {
        return {
            fetchCount: function (params) {
                var resource = CountResource.get(params);
                return {
                    'resource': resource,
                    '$promise': resource.$promise
                };
            }
        };
    }

})();
