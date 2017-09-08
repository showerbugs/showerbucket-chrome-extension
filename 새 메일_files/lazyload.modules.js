/**
 * @ngdoc overview
 * @name doorayWebApp.lazyload
 * @description
 * # doorayWebApp.lazyload
 *
 * Config module of the application.
 */

(function () {

    'use strict';

    angular
        .module('doorayWebApp.lazyload', [
            'doorayWebApp.lazyload.bower',
            'doorayWebApp.lazyload.vendor',
            'doorayWebApp.lazyload.dooray',
            'oc.lazyLoad'
        ]);
})();
