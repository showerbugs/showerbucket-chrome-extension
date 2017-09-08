/**
 * @ngdoc overview
 * @name doorayWebApp.common
 * @description
 * # doorayWebApp.common
 *
 * Common Config module of the application.
 */

(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .constant('_', window._)    //http://stackoverflow.com/questions/23862119/how-to-make-lodash-work-with-angular-js
        .constant('moment', window.moment)
        .constant('CONFIG', (function () {
            var config = {
                'env': 'local', // or 'dev', or 'alpha'
                'orgMemberId': 0
            };
            return {
                keys: function () {
                    var keys = [];
                    for (var prop in config) {
                        keys.push(prop);
                    }
                    return keys;
                },
                set: function (key, value) {
                    config[key] = value;
                },
                get: function (key) {
                    return config[key];
                }
            };
        })())
        .config(configHttpProvider)
        .config(configCompileProvider)
        .config(configDynamicLocaleProvider)
        .config(configRouterProvider)
        .config(configUrlMatcherTypesProvider)
        .run(runInitializeMoment);

    /* @ngInject */
    function configHttpProvider($httpProvider) {
        $httpProvider.useApplyAsync(true);
    }

    /* @ngInject */
    function configCompileProvider($compileProvider) {
        // disable debug info
        $compileProvider.debugInfoEnabled(false);
    }

    /* @ngInject */
    function configDynamicLocaleProvider(tmhDynamicLocaleProvider) {
        tmhDynamicLocaleProvider.localeLocationPattern('/statics/scripts/angular-i18n/angular-locale_{{locale}}.js');
    }

    /* @ngInject */
    function configRouterProvider($urlMatcherFactoryProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $urlMatcherFactoryProvider.strictMode(false);
    }

    /* @ngInject */
    function configUrlMatcherTypesProvider($urlMatcherFactoryProvider) {
        $urlMatcherFactoryProvider.type('boolean', {
            name: 'boolean',
            decode: function (val) {
                return val === true || val === "true";
            },
            encode: function (val) {
                return !!val;
            },
            equals: function (a, b) {
                return this.is(a) && a === b;
            },
            is: function (val) {
                return [true, false, 0, 1].indexOf(val) >= 0;
            },
            pattern: /bool|true|0|1/
        });

        $urlMatcherFactoryProvider.type('nonURIEncoded', {
            encode: valToString,
            decode: valToString,
            is: function (val) {
                return val === null || !angular.isDefined(val) || typeof val === "string";
            },
            pattern: /[^/]*/
        });

        //https://github.com/angular-ui/ui-router/issues/1119
        // '/'가 오면 encoding이 2번되는 ui-router 문제. custom으로 만들어서 해결
        function valToString(val) {
            return val ? val.toString() : val;
        }
    }

    /* @ngInject */
    function runInitializeMoment(HelperConfigUtil, HelperLocaleUtil, moment) {
        moment.locale(HelperConfigUtil.locale() || HelperLocaleUtil.defaultLanguage());
        moment.tz.setDefault(HelperConfigUtil.timezone() || moment.tz.guess());
    }

})();
