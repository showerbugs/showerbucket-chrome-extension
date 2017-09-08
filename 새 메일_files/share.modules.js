/**
 * @ngdoc overview
 * @name doorayWebApp.share
 * @description
 * # doorayWebApp.share
 *
 * Shared Config module of the application.
 */

(function () {

    'use strict';

    angular
        .module('doorayWebApp.share', [
            'ngResource',
            'ngMessages',
            //'ngSanitize',//must be static loaded because they are to tightly integrated into AngularJS. An incomplete list of modules not lazy-loadable: ngAnimate, ngRoute, ngSanitizer, ngTouch.
            'ngLocale',
            'ngMaterial',
            'ng.deviceDetector',
            'ui.utils',
            'ui.bootstrap',
            'angularMoment'
        ]);
})();
