(function () {

    'use strict';

    angular
        .module('doorayWebApp.popup')
        .component('translatorPage', {
            templateUrl: 'modules/popup/translatorPage/translatorPage.html',
            controller: Translator
        }).constant('TRANSLATION_LANG_SET', [{"Afrikaans": "af"}, {"Albanian": "sq"}, {"Amharic": "am"}, {"Arabic": "ar"}, {"Armenian": "hy"},
            {"Azeerbaijani": "az"}, {"Basque": "eu"}, {"Belarusian": "be"}, {"Bengali": "bn"}, {"Bosnian": "bs"}, {"Bulgarian": "bg"},
            {"Catalan": "ca"}, {"Cebuano": "ceb"}, {"Chichewa": "ny"}, {"Chinese(Simplified)": "zh-CN"}, {"Chinese(Traditional)": "zh-TW"}, {"Corsican": "co"}, {"Croatian": "hr"},
            {"Czech": "cs"}, {"Danish": "da"}, {"Dutch": "nl"}, {"English": "en"}, {"Esperanto": "eo"}, {"Estonian": "et"}, {"Filipino": "tl"},
            {"Finnish": "fi"}, {"French": "fr"}, {"Frisian": "fy"}, {"Galician": "gl"}, {"Georgian": "ka"}, {"German": "de"}, {"Greek": "el"},
            {"Gujarati": "gu"}, {"Haitian Creole": "ht"}, {"Hausa": "ha"}, {"Hawaiian": "haw"}, {"Hebrew": "iw"}, {"Hindi": "hi"}, {"Hmong": "hmn"},
            {"Hungarian": "hu"}, {"Icelandic": "is"}, {"Igbo": "ig"}, {"Indonesian": "id"}, {"Irish": "ga"}, {"Italian": "it"}, {"Japanese": "ja"},
            {"Javanese": "jw"}, {"Kannada": "kn"}, {"Kazakh": "kk"}, {"Khmer": "km"}, {"Korean": "ko"}, {"Kurdish": "ku"}, {"Kyrgyz": "ky"}, {"Lao": "lo"},
            {"Latin": "la"}, {"Latvian": "lv"}, {"Lithuanian": "lt"}, {"Luxembourgish": "lb"}, {"Macedonian": "mk"}, {"Malagasy": "mg"}, {"Malay": "ms"},
            {"Malayalam": "ml"}, {"Maltese": "mt"}, {"Maori": "mi"}, {"Marathi": "mr"}, {"Mongolian": "mn"}, {"Burmese": "my"}, {"Nepali": "ne"},
            {"Norwegian": "no"}, {"Pashto": "ps"}, {"Persian": "fa"}, {"Polish": "pl"}, {"Portuguese": "pt"}, {"Punjabi": "ma"}, {"Romanian": "ro"},
            {"Russian": "ru"}, {"Samoan": "sm"}, {"Scots Gaelic": "gd"}, {"Serbian": "sr"}, {"Sesotho": "st"}, {"Shona": "sn"}, {"Sindhi": "sd"},
            {"Sinhala": "si"}, {"Slovak": "sk"}, {"Slovenian": "sl"}, {"Somali": "so"}, {"Spanish": "es"}, {"Sundanese": "su"}, {"Swahili": "sw"},
            {"Swedish": "sv"}, {"Tajik": "tg"}, {"Tamil": "ta"}, {"Telugu": "te"}, {"Thai": "th"}, {"Turkish": "tr"}, {"Ukrainian": "uk"}, {"Urdu": "ur"},
            {"Uzbek": "uz"}, {"Vietnamese": "vi"}, {"Welsh": "cy"}, {"Xhosa": "xh"}, {"Yiddish": "yi"}, {"Yoruba": "yo"}, {"Zulu": "zu"}]);

    /* @ngInject */
    function Translator($scope, $window, MIME_TYPE, TRANSLATION_LANG_SET, DomainRepository, TranslationRepository, _) {
        var $ctrl = this,
            PREVIOUS_DEFINED_CODES = ['zh-CN', 'en', 'ko', 'ja'];

        $ctrl.$onInit = function () {
            $ctrl.sourceContent = $window.content && $window.content.trim() || '';
            $ctrl.editor = $window.editor;
            $ctrl.targetContent = '';
            $ctrl.sourceLang = 'ko';
            $ctrl.targetLang = 'en';
            $ctrl.TRANSLATION_LANG_SET = _(TRANSLATION_LANG_SET).map(function(obj) {
                return {
                    lang: Object.keys(obj)[0],
                    code: Object.values(obj)[0]
                };
            }).filter(function (obj) {
                return !_.includes(PREVIOUS_DEFINED_CODES, obj.code);
            }).value();

            DomainRepository.useNaverTranslatorPromise().then(function () {
                $ctrl.isLineisTenant = true;
            });
        };

        $scope.$watch(function () {
            return $ctrl.sourceLang + $ctrl.targetLang;
        }, function (newVal) {
            if (newVal) {
                $ctrl.translate();
            }
        });

        $ctrl.$onDestroy = function () {
            if($ctrl.editor) {
                $ctrl.editor.focus();
            }
            $ctrl.editor = window.editor = null;
        };

        $ctrl.translate = function () {
            if($ctrl.sourceContent === '') {
                return;
            }
            TranslationRepository.translate([$ctrl.sourceContent], $ctrl.sourceLang, $ctrl.targetLang).then(function (text) {
                $ctrl.targetContent = text[0];
            });
        };

        $ctrl.appendText = function (text) {
            if (window.model.mimeType === MIME_TYPE.HTML.type) {
                text = $ctrl.editor.html.get() + '\n\n<hr>\n\n' + text;
                text = text.replace(/\n/g, '<br/>');
                $ctrl.editor.html.set(text);
            } else {
                text = $ctrl.editor.getValue() + '\n\n---\n\n' + text;
                $ctrl.editor.setValue(text);
            }
            window.model.content = text;
            $ctrl.editor.focus();
            $window.close();
        };

        $ctrl.getCombinedContent = function () {
            return $ctrl.sourceContent + '\n\n---\n\n' + $ctrl.targetContent;
        };
    }

})();
