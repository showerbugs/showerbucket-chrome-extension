(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .factory('DomainResource', DomainResource)
        .factory('DomainRepository', DomainRepository);

    /* @ngInject */
    function DomainResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/domains', {}, {
            'get': {method: 'GET'},
            'save': {method: 'POST'}
        });
    }

    /* @ngInject */
    function DomainRepository($q, USE_NAVER_TRANSLATOR_TENANT, HelperPromiseUtil, DomainResource, _) {
        var listContents = [],
            defaultDomain = null,
            cachedPromise = null;

        // Public API here
        return {
            fetchAndCache: fetchAndCache,
            getOrFetch: getOrFetch,
            defaultDomainPromise: defaultDomainPromise,
            getContents: getContents,
            getDefaultDomain: getDefaultDomain,
            useNaverTranslatorPromise: useNaverTranslatorPromise
        };

        function fetchAndCache() {
            HelperPromiseUtil.cancelResource(cachedPromise);
            cachedPromise = DomainResource.get();
            return cachedPromise.$promise.then(function (result) {
                listContents = result.contents();
                defaultDomain = _.get(_.find(listContents, {'default': true}), 'domain', null);
                return result;
            });
        }

        function getOrFetch() {
            return _setListPromise().then(function () {
                return listContents;
            });
        }

        function defaultDomainPromise() {
            return _setListPromise().then(function () {
                return defaultDomain;
            });
        }

        function getContents() {
            return listContents;
        }

        function getDefaultDomain() {
            return defaultDomain;
        }

        function useNaverTranslatorPromise() {
            return defaultDomainPromise().then(function (domain) {
                return _.includes(USE_NAVER_TRANSLATOR_TENANT, domain) ? $q.when() : $q.reject();
            });
        }

        function _setListPromise() {
            return _.isEmpty(listContents) ? fetchAndCache() : $q.when();
        }
    }

})();
