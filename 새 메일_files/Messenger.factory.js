(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('MessengerResource', MessengerResource)
        .factory('Messenger', Messenger);

    /* @ngInject */
    function MessengerResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/channels', {

        }, {
            'get': {method: 'GET'}
        });
    }

    /* @ngInject */
    function Messenger(API_PAGE_SIZE, MessengerResource) {
        return{
            fetchList: function(){
                return MessengerResource.get({page: 0, size: API_PAGE_SIZE.ALL}).$promise;
            }
        };
    }

})();
