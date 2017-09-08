(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('MessengerFileAccessResource', MessengerFileAccessResource)
        .factory('FileAccessLogBiz', FileAccessLogBiz);

    /* @ngInject */
    function MessengerFileAccessResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/files-accesses/messenger', {}, {
            'get': { method: 'GET'}
        });
    }

    /* @ngInject */
    function FileAccessLogBiz(MessengerFileAccessResource) {
        return {
            fetchMessengerLogList: function (params) {
                return MessengerFileAccessResource.get(params).$promise;
            }
        };
    }

})();
