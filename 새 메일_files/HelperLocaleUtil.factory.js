(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .factory('HelperLocaleUtil', HelperLocaleUtil);

    /* @ngInject */
    function HelperLocaleUtil($cookies, $rootScope, $window, gettextCatalog, tmhDynamicLocale, moment, _) {
        //gettextCatalog.debug = true;  //TODO 한글 매핑이 완성된 후
        var languageMap = {
            'ko_KR': {locale: 'ko', country: 'kr', name: '한국어'},
            'en_US': {locale: 'en', country: 'us', name: 'English'},
            'ja_JP': {locale: 'ja', country: 'jp', name: '日本語'},
            'zh_CN': {locale: 'zh', country: 'cn', name: '简体中文'}
        };

        var momentMap = {
            ko: {
                calendar: {
                    nextWeek: 'YYYY.MM.DD (dd)',
                    nextDay: '내일까지',
                    sameDay: '오늘까지',
                    lastDay: 'YYYY.MM.DD (dd)',
                    lastWeek: 'YYYY.MM.DD (dd)',
                    sameElse: 'YYYY.MM.DD (dd)'
                }
            },
            ja: {
                calendar: {
                    nextWeek: 'YYYY.MM.DD (dd)',
                    nextDay: '明日まで',
                    sameDay: '今日まで',
                    lastDay: 'YYYY.MM.DD (dd)',
                    lastWeek: 'YYYY.MM.DD (dd)',
                    sameElse: 'YYYY.MM.DD (dd)'
                }
            },
            zh: {
                calendar: {
                    nextWeek: 'YYYY.MM.DD (dd)',
                    nextDay: '直到明天',
                    sameDay: '直到今天',
                    lastDay: 'YYYY.MM.DD (dd)',
                    lastWeek: 'YYYY.MM.DD (dd)',
                    sameElse: 'YYYY.MM.DD (dd)'
                }
            },
            en: {}
        };

        return {
            defaultLanguage: function () {
                //쿠키에 설정된 locale 정보를 읽고 없으면 userAgent 기본 자동값 설정
                var navLanguage = _($window.navigator).pick(['language', 'browserLanguage', 'systemLanguage', 'userLanguage']).valuesIn().value()[0];
                return $cookies.get('language') || this.findLanguageByLocale(navLanguage) || 'en_US';
            },

            setLanguage: function (lang, withoutReload, withBroadcastMsg) {
                var locale = languageMap[lang] ? languageMap[lang].locale : _.get(languageMap, 'en_US.locale');
                $rootScope.locale = locale;
                moment.updateLocale(locale, momentMap[locale]);
                tmhDynamicLocale.set(locale);
                //for bind once translate directive by prevent broadcast gettextLanguageChanged msg
                gettextCatalog.currentLanguage = lang;

                if (withBroadcastMsg) {
                    gettextCatalog.setCurrentLanguage(lang);
                }

                if (!withoutReload) {   //expired after 3 months
                    $cookies.put('language', lang, {
                        domain: 'dooray.com',
                        expires: moment().add(3, 'months').toDate()
                    });
                    $window.location.reload();
                }
            },
            getLanguage: function () {
                return gettextCatalog.getCurrentLanguage();
            },
            findLanguageByLocale: function (locale) {   //ko, en
                locale = locale ? locale.substring(0, 2) : locale;
                return _.findKey(languageMap, {'locale': locale}) || 'en_US';// default en_US
            },
            getLanguageList: function () {
                return [
                    {code: 'ko_KR', name: '한국어'},
                    {code: 'en_US', name: 'English'},
                    {code: 'ja_JP', name: '日本語'},
                    {code: 'zh_CN', name: '简体中文'}
                ];
            }
        };
    }

})();
