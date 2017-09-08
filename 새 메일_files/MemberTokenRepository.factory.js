(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .factory('MemberTokenResource', MemberTokenResource)
        .factory('MemberTokenRepository', MemberTokenRepository);

    /* @ngInject */
    function MemberTokenResource($resource, ApiConfigUtil) {
        var tokensUrl = ApiConfigUtil.wasContext() + '/members/me/tokens';
        return $resource(tokensUrl, {
        }, {
            get: {method: 'GET'},
            generate: {url: tokensUrl + '/generate', method: 'POST'},
            regenerate: {url: tokensUrl + '/:tokenId/regenerate', method: 'POST'}
        });
    }

    /* @ngInject */
    function MemberTokenRepository(MemberTokenResource, _) {
        var promise,
            validToken = {};

        return {
            fetchOrGenerateAndCache: fetchOrGenerateAndCache,
            getOrFetch: getOrFetch,
            getToken: getToken,
            regenerate: regenerate
        };

        function fetchOrGenerateAndCache() {
            promise = MemberTokenResource.get({valid: true}).$promise.then(function (result) {
                if (!_.isEmpty(result.contents()[0])) {
                    return result.contents()[0];
                }

                return MemberTokenResource.generate({type: 'any'}).$promise.then(function (result) {
                    return result.result();
                });
            }).then(function (_validToken) {
                validToken = _validToken;
                return validToken;
            });
            return promise;
        }

        function getOrFetch() {
            return _.isEmpty(validToken) ? fetchOrGenerateAndCache() : promise;
        }

        function getToken() {
            return validToken;
        }

        function regenerate(tokenId) {
            return MemberTokenResource.regenerate({tokenId: tokenId}, {type: 'any'}).$promise.then(function (result) {
                validToken = result.result();
                return validToken;
            });
        }
    }

})();
