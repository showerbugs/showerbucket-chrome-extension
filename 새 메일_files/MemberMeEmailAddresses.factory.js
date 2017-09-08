(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('MemberMeEmailAddressesResource', MemberMeEmailAddressesResource)
        .factory('MemberMeEmailAddresses', MemberMeEmailAddresses);

    /* @ngInject */
    function MemberMeEmailAddressesResource($cacheFactory, $resource, ApiConfigUtil) {
        var cache = $cacheFactory('MemberMeEmailAddressesResource');
        return $resource(ApiConfigUtil.wasContext() + '/members/me/email-addresses/:emailAddressId', {
            'emailAddressId': '@emailAddressId'
        }, {
            'get': {method: 'GET', cache: cache},
            'query': {method: 'GET', cache: cache},
            'save': {method: 'POST'},
            'update': {method: 'PUT'}
        });
    }

    /* @ngInject */
    function MemberMeEmailAddresses($cacheFactory, RootScopeEventBindHelper, MemberMeEmailAddressesResource) {
        var EVENTS = {
            'RESETCACHE': 'MemberMeEmailAddresses:resetCache'
        };

        var resetCache = function () {
            $cacheFactory.get('MemberMeEmailAddressesResource').removeAll();
            RootScopeEventBindHelper.emit(EVENTS.RESETCACHE);
        };

        function resetCacheAndResultThrough(result) {
            resetCache();
            return result;
        }

        return {
            EVENTS: EVENTS,
            resetCache: resetCache,

            fetchList: function (params) {
                return MemberMeEmailAddressesResource.query(params).$promise;
            },

            fetchListWithConfirmStatus: function () {
                return this.fetchList({ status : 'confirmed' });
            },

            fetch: function (emailAddressId) {
                return MemberMeEmailAddressesResource.get({emailAddressId: emailAddressId}).$promise;
            },

            add: function (emailAddressForm) {
                return MemberMeEmailAddressesResource.save(emailAddressForm).$promise.then(resetCacheAndResultThrough);
            },

            update: function (emailAddressForm) {
                return MemberMeEmailAddressesResource.update(emailAddressForm).$promise.then(resetCacheAndResultThrough);
            },

            remove: function (emailAddressId) {
                return MemberMeEmailAddressesResource.delete({emailAddressId: emailAddressId}).$promise.then(resetCacheAndResultThrough);
            }
        };
    }

})();
