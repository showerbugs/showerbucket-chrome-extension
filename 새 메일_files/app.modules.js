/**
 * @ngdoc overview
 * @name doorayWebApp
 * @description
 * # doorayWebApp
 *
 * Shared Template module of the application.
 */

(function () {

    'use strict';

    angular
        .module('doorayWebApp', [
            'doorayWebApp.common',
            'doorayWebApp.share'
        ]);

    //current app injector
    //angular.element(document).injector().invoke(function (MessageModalFactory) {
    //    MessageModalFactory.confirm('test');
    //});
    //angular.injector(['doorayApp']).get('$rootElement')

    //new app injector
    //angular.injector(["doorayWebApp"]).invoke(function (MessageModalFactory) {
    //    MessageModalFactory.confirm('test');
    //});
})();
