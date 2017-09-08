/**
 * @ngdoc overview
 * @name doorayWebApp.setting.user
 * @description
 * # doorayWebApp.setting.user
 *
 * Index Config module of the application.
 */

(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user', [])
        .constant('ID_PROVIDER_ID', {
            1: 'PAYCO',
            4: 'SSO',
            5: 'Dooray',
            6: 'SSO'
        });
})();
