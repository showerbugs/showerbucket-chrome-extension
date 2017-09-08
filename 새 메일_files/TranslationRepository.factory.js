(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .factory('TranslationResource', TranslationResource)
        .factory('TranslationRepository', TranslationRepository);

    /* @ngInject */
    function TranslationResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/translators/translate', {}, {
            'post': {method: 'POST'}
        });
    }

    /* @ngInject */
    function TranslationRepository(TranslationResource, _) {
        return {
            translate: translate
        };

        function translate(sourceText, sourceLang, targetLang, format) {
            return TranslationResource.post({
                text: sourceText,
                sourceLanguage: sourceLang,
                targetLanguage: targetLang,
                format: format || 'text'
            }).$promise.then(function (result) {
                    return _.get(result, '_data._result.translatedText', '');
                });
        }
    }

})();
