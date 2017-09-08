(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .factory('MailSignatureRepository', MailSignatureRepository);

    /* @ngInject */
    function MailSignatureRepository(SettingResource) {
        var CATEGORY = 'mail.signature',
            content = {};

        return {
            fetchAndCache: fetchAndCache,
            replaceContent: replaceContent,
            getContent: getContent,
            updateContent: updateContent
        };

        function fetchAndCache() {
            return SettingResource.get(_getParam()).$promise.then(function (res) {
                replaceContent(res.contents().value);
                return res;
            });
        }

        function getContent() {
            return content;
        }

        function replaceContent(model) {
            content = _.assign({}, model);
        }

        function updateContent(content) {
            return SettingResource.update(_getParam(), content).$promise.then(function () {
                replaceContent(content);
            });
        }

        function _getParam() {
            return {category: CATEGORY, memberId: 'me'};
        }

    }

})();
