(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .factory('MailSecuritySettingsResource', MailSecuritySettingsResource)
        .factory('MailSecuritySettingsRepository', MailSecuritySettingsRepository);

    /* @ngInject */
    function MailSecuritySettingsResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/settings/mail.security', {}, {
            'get': {method: 'GET'},
            'update': {method: 'PUT'}
        });
    }

    /* @ngInject */
    function MailSecuritySettingsRepository(MailSecuritySettingsResource) {
        var contentMap = {};

        return {
            fetchAndCache: fetchAndCache,
            getContent: getContent,
            update: update
        };

        function fetchAndCache() {
            return MailSecuritySettingsResource.get().$promise.then(function (res) {
                contentMap = res.contents();
                return res;
            });
        }

        function getContent() {
            return contentMap;
        }

        function update(param) {
            return MailSecuritySettingsResource.update(param).$promise.then(fetchAndCache);
        }
    }

})();
