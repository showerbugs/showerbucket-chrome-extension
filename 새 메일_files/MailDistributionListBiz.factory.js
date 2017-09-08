(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailDistributionListResource', MailDistributionListResource)
        .factory('MailDistributionListBiz', MailDistributionListBiz);

    /* @ngInject */
    function MailDistributionListResource($cacheFactory, $resource, ApiConfigUtil) {
        var cache = $cacheFactory('MailDistributionListResource');
        return $resource(ApiConfigUtil.wasContext() + '/distribution-lists/:distributionListId', {
            'distributionListId': '@distributionListId'
        }, {
            'query': {method: 'GET', cache: cache},
            'get': {method: 'GET', cache: cache},
            'save': {method: 'POST'},
            'update': {method: 'PUT'},
            'remove': {method: 'DELETE'}
        });
    }

    /* @ngInject */
    function MailDistributionListBiz($cacheFactory, MailDistributionListResource, RootScopeEventBindHelper) {
        var EVENTS = {
            'RESETCACHE': 'MailDistributionListResource:resetCache'
        };

        var resetCache = function () {
            $cacheFactory.get('MailDistributionListResource').removeAll();
            RootScopeEventBindHelper.emit(EVENTS.RESETCACHE);
        };
        return {
            EVENTS: EVENTS,
            resetCache: resetCache,

            fetchListAll: function () {
                return MailDistributionListResource.query().$promise;
            },

            fetchList: function (param) {
                return MailDistributionListResource.query(param).$promise;
            },

            fetch: function (distributionListId, params) {
                return MailDistributionListResource.get({distributionListId: distributionListId}, params).$promise;
            },

            add: function (param, submitData) {
                return MailDistributionListResource.save(param, [submitData]).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            },

            update: function (param) {
                return MailDistributionListResource.update(param).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            },

            remove: function (param) {
                return MailDistributionListResource.remove(param).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            }
        };
    }

})();
