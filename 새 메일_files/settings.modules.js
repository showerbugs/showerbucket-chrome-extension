/**
 * @ngdoc overview
 * @name doorayWebApp.settings
 * @description
 * # doorayWebApp.settings
 *
 * Index Config module of the application.
 */

(function () {

    'use strict';

    angular
        .module('doorayWebApp.settings', [
            'doorayWebApp.setting.common',
            'doorayWebApp.setting.admin',
            'doorayWebApp.setting.user'
        ]);
})();
