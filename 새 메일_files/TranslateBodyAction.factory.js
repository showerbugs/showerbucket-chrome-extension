(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('TranslateBodyAction', TranslateBodyAction);

    /* @ngInject */
    function TranslateBodyAction($q, TRANSLATION_LANG_SET, DomainRepository, HelperConfigUtil, HelperLocaleUtil, TranslationRepository) {
        var BODY_CONTENT_IN_MARKDOWN_REGEX = /(?:<span[^>]*>)?(?:(?:-&gt;&gt;)|(?:-&gt;))?(?:<\/span>)?<a[^>]*href="(?:dooray:\/\/\d+?\/(?:[\w-]+)\/(?:\d+))?[^>]+|<pre(?:[^.]|\n)+\/pre>|(<\/?[^>]+>)\n?([^<]+)/g,
            MAX_CALL_ARRAY_SIZE = 50,
            enableLangSet = _.map(TRANSLATION_LANG_SET, function (obj) {return _.values(obj)[0];}),
            enableLineisTenantLang = ['en', 'ko', 'ja'];

        return {
            translateMarkdownBody: translateMarkdownBody,
            findFromLang: findFromLang,
            getDefaultTranslation: getDefaultTranslation
        };

        function translateMarkdownBody(contentHtml, sourceLang, targetLang) {
            return _translateBody(contentHtml, _convertTranslatorLanguage(sourceLang), targetLang);
        }

        function findFromLang(sourceLang, item, fromId) {
            if (sourceLang !== 'auto') {
                return sourceLang;
            }
            // locale 값이 아직 setting되지 않았으면 ko_KR로 설정 (임시)
            return _.get(item._wrap.refMap.organizationMemberMap(fromId), 'locale') || 'ko_KR';
        }

        function getDefaultTranslation() {
            var locale = HelperConfigUtil.locale() || HelperLocaleUtil.defaultLanguage();
            return {
                sourceLang: 'auto',
                targetLang: locale.substr(0, 2)
            };
        }

        function _translateBody(contentHtml, sourceLang, targetLang) {
            return DomainRepository.useNaverTranslatorPromise().then(function() {
                if (!_hasExceptLanguageInLine(sourceLang, targetLang)) {
                    return $q.reject();
                }
            }).catch(function () {
                var contents = [];
                contentHtml.replace(BODY_CONTENT_IN_MARKDOWN_REGEX, function (match, tag, content) {
                    if (content && content.trim()) {
                        contents.push(content);
                    }
                });

                if (_.isEmpty(contents) || sourceLang === targetLang) {
                    return $q.when(contentHtml);
                }

                return $q.all(_(contents).chunk(MAX_CALL_ARRAY_SIZE).map(function (contents) {
                    return TranslationRepository.translate(contents, sourceLang, targetLang);
                }).value()).then(function (results) {
                    var translatedContents = _.flatten(results);
                    var i = 0;

                    return contentHtml.replace(BODY_CONTENT_IN_MARKDOWN_REGEX, function (match, tag, content) {
                        if (content && content.trim()) {
                            if (!translatedContents[i]) {
                                i += 1;
                                return match;
                            }
                            return tag + translatedContents[i++].trim();
                        }
                        return match;
                    });
                });
            });
        }

        function _convertTranslatorLanguage(lang) {
            return enableLangSet.indexOf(lang) > -1 ? lang : lang.substr(0, 2);
        }

        function _hasExceptLanguageInLine(sourceLang, targetLang) {
            return !_.includes(enableLineisTenantLang, sourceLang) || !_.includes(enableLineisTenantLang, targetLang);
        }
    }

})();
