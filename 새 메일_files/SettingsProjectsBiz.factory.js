(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('SettingsProjectsResource', SettingsProjectsResource)
        .factory('SettingsProjectsBiz', SettingsProjectsBiz);

    /* @ngInject */
    function SettingsProjectsResource($cacheFactory, $resource, ApiConfigUtil) {
        var cache = $cacheFactory('SettingsProjectsResource');
        return $resource(ApiConfigUtil.wasContext() + '/organizations/:orgCode/settings/projects', {
            orgCode: '@orgCode'
        }, {
            'get': {method: 'GET', cache: cache},
            'update': {method: 'PUT'}
        });
    }

    /* @ngInject */
    function SettingsProjectsBiz($cacheFactory, RootScopeEventBindHelper, SettingsProjectsResource, API_PAGE_SIZE) {
        var EVENTS = {
            'RESETCACHE': 'SettingsProjects:resetCache'
        };

        var resetCache = function () {
            $cacheFactory.get('SettingsProjectsResource').removeAll();
            RootScopeEventBindHelper.emit(EVENTS.RESETCACHE);
        };

        return {
            EVENTS: EVENTS,
            resetCache: resetCache,

            fetch: function (orgCode) {
                return SettingsProjectsResource.get({orgCode: orgCode || '*', page: 0, size: API_PAGE_SIZE.ALL}).$promise;
            },

            update: function (orgCode, params) {
                return SettingsProjectsResource.update({orgCode: orgCode}, params).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            }
        };
    }

})();
