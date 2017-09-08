(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('SettingResource', SettingResource)
        .factory('DefaultSettingResource', DefaultSettingResource)
        .factory('SettingBiz', SettingBiz);

    /* @ngInject */
    function SettingResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/members/:memberId/settings/:category', {
            'memberId': '@memberId',
            'category': '@category'
        }, {
            'get': {method: 'GET'},
            'update': {method: 'PUT'}
        });
    }

    /* @ngInject */
    function DefaultSettingResource($cacheFactory, $resource, ApiConfigUtil) {
        var cache = $cacheFactory('DefaultSettingResource');
        return $resource(ApiConfigUtil.wasContext() + '/members/:memberId/default-settings/:category', {
            'memberId': '@memberId',
            'category': '@category'
        }, {
            'get': {method: 'GET', cache: cache}
        });
    }

    /* @ngInject */
    function SettingBiz(RootScopeEventBindHelper, SettingResource, _) {
        var EVENTS = {
            'RESETCACHE': 'SettingResource:resetCache'
        };

        var resetCache = function () {
            RootScopeEventBindHelper.emit(EVENTS.RESETCACHE);
        };

        return {
            EVENTS: EVENTS,
            resetCache: resetCache,

            fetchMySetting: function (category) {
                return SettingResource.get({memberId: 'me', category: category}).$promise.then(function(result){
                    return _.get(result.contents(), 'value');
                });
            },

            updateMySetting: function (category, params) {
                return SettingResource.update({memberId: 'me', category: category}, params).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            }
        };
    }


})();
