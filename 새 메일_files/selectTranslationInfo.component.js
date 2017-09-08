(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .component('selectTranslationInfo', {
            templateUrl: 'modules/components/selectTranslationInfo/selectTranslationInfo.html',
            controller: SelectTranslationInfo,
            bindings: {
                sourceLang: '<',
                targetLang: '<',
                translateContent: '&',
                showRawContent: '&'
            }
        });

    /* @ngInject */
    function SelectTranslationInfo(TRANSLATION_LANG_SET, DomainRepository, gettextCatalog, _) {
        var $ctrl = this,
            LINEIS_LANGUAGES = [{
                lang: 'Korean',
                code: 'ko'
            }, {
                lang: 'English',
                code: 'en'
            }, {
                lang: 'Japanese',
                code: 'ja'
            }],
            PREDEFINED_LANGUAGES = [{
                lang: 'Korean',
                code: 'ko'
            }, {
                lang: 'English',
                code: 'en'
            }, {
                lang: 'Japanese',
                code: 'ja'
            }, {
                lang: 'Chinese(Simplified)',
                code: 'zh-CN'
            }, {
                lang: 'Chinese(Traditional)',
                code: 'zh-TW'
            }];

        $ctrl.translate = translate;
        $ctrl.swapSourceTarget = swapSourceTarget;

        _init();

        function translate() {
            $ctrl.translateContent({sourceLang: $ctrl.sourceLang, targetLang: $ctrl.targetLang});
        }

        function swapSourceTarget(sourceLang, targetLang) {
            if (sourceLang === 'auto') {
                return;
            }
            $ctrl.sourceLang = targetLang;
            $ctrl.targetLang = sourceLang;
        }

        function _init() {
            DomainRepository.useNaverTranslatorPromise().then(function () {
                $ctrl.filterItemList = LINEIS_LANGUAGES;
                $ctrl.targetDropdownList = LINEIS_LANGUAGES;
                $ctrl.sourceDropdownList = [{lang: gettextCatalog.getString('등록자 언어'), code: 'auto'}].concat($ctrl.targetDropdownList);
            }).catch(function () {
                $ctrl.filterItemList = _.map(TRANSLATION_LANG_SET, function (obj) {
                    return {
                        lang: Object.keys(obj)[0],
                        code: Object.values(obj)[0]
                    };
                });
                $ctrl.targetDropdownList = PREDEFINED_LANGUAGES.concat([{code: 'divider', lang: 'divider'}], $ctrl.filterItemList);
                $ctrl.sourceDropdownList = [{lang: gettextCatalog.getString('등록자 언어'), code: 'auto'}].concat($ctrl.targetDropdownList);
            });
        }

    }

})();
