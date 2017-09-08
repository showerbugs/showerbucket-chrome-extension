(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('SmartFolderResource', SmartFolderResource)
        .factory('SmartFolderBiz', SmartFolderBiz);

    /* @ngInject */
    function SmartFolderResource($cacheFactory, $resource, ApiConfigUtil) {
        var cache = $cacheFactory('SmartFolderResource');
        return $resource(ApiConfigUtil.wasContext() + '/mail-smart-folders/:folderId', {
            'folderId': '@folderId'
        }, {
            'get': {method: 'GET', cache: cache},
            'save': {method: 'POST', isArray: true},
            'update': {method: 'PUT'},
            'remove': {method: 'remove'}
        });
    }

    /* @ngInject */
    function SmartFolderBiz($cacheFactory, RootScopeEventBindHelper, SmartFolderResource) {
        var EVENTS = {
            'RESETCACHE': 'SmartFolderResource:resetCache'
        };

        var resetCache = function () {
            $cacheFactory.get('SmartFolderResource').removeAll();
            RootScopeEventBindHelper.emit(EVENTS.RESETCACHE);
        };

        return {
            EVENTS: EVENTS,
            resetCache: resetCache,

            fetchList: function () {
                return SmartFolderResource.get().$promise.then(function (result) {
                    return result;
                });
            },

            getPromise: function (folderId) {
                return SmartFolderResource.get({'folderId': folderId}).$promise.then(function (result) {
                    return result;
                });
            },

            //params = { "name": "오늘 받은 메일", "order": 10, "condition": { // TBD }}
            add: function (params) {
                return SmartFolderResource.save([params]).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            },

            //folderId = '1', params = { "name": "오늘 받은 메일", "order": 10, "condition": { // TBD }}
            update: function (folderId, params) {
                return SmartFolderResource.update({'folderId': folderId}, params).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            },

            //folderId = '1'
            remove: function (folderId) {
                return SmartFolderResource.update({'folderId': folderId}).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            }
        };
    }

})();
