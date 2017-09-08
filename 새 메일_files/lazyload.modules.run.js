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
        .module('doorayWebApp.lazyload')
        .config(configLazyLoadProvider);

    /* @ngInject */
    function configLazyLoadProvider($ocLazyLoadProvider, BOWER_DEPENDENCIES, VENDOR_DEPENDENCIES, DOORAY_DEPENDENCIES) {
        $ocLazyLoadProvider.config({
            //debug: true,
            //events: true,
            modules: BOWER_DEPENDENCIES.depsArray
                .concat(VENDOR_DEPENDENCIES.depsArray)
                .concat(DOORAY_DEPENDENCIES.depsArray)
        });
    }

})();
