/**
 * @ngdoc overview
 * @name doorayWebApp.main.bootstrap
 * @description
 * # doorayWebApp.main.bootstrap
 *
 * Index Router Config module of the application.
 */

(function () {

    'use strict';

    angular
        .module('doorayWebApp.main.bootstrap', [
            'doorayWebApp',
            'doorayWebApp.components',
            'doorayWebApp.render',
            'doorayWebApp.editor',
            'doorayWebApp.layout',
            'doorayWebApp.project',
            'doorayWebApp.stream',
            'doorayWebApp.settings',
            'doorayWebApp.mail',
            'doorayWebApp.calendar',
            'doorayWebApp.popup',
            'doorayWebApp.log',
            'doorayWebApp.lazyload'
        ]);
})();
