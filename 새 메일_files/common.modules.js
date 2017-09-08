/**
 * @ngdoc overview
 * @name doorayWebApp.common
 * @description
 * # doorayWebApp.common
 *
 * Index Router Config module of the application.
 */

(function () {

    'use strict';

    angular
        .module('doorayWebApp.common', [
            'ngCookies',
            'ui.router',

            'gettext',
            'tmh.dynamicLocale',
            'doorayWebApp.translation',
            'doorayWebApp.templateCache'
        ]);
})();
