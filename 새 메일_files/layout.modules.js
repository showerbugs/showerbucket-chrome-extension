(function () {

    'use strict';

    /**
     * @ngdoc overview
     * @name doorayWebApp.layout
     * @description
     * # doorayWebApp.layout
     *
     * Config module of the application.
     */

    angular.module('doorayWebApp.layout', [
        'flow',
        'ui.gravatar',
        'ui.select',
        'ngStorage',
        'sun.scrollable',
        'ngWebSocket',
        'angular.filter',
        'typeahead-focus',
        'isteven-multi-select',
        //'multi-transclude', //TODO 이후 사용할 때 주석 제거
        //'nvd3',   // TO LazyLoa
        'trello',
        'dndLists',
        'ang-drag-drop',
        'ui.checkbox',
        'angular-growl',

        // vendor
        'angular-bootstrap-select', // vender/angular-bootstrap-select.js
        'bootstrapLightbox',        // vendor.all.js.jsp vendor.lazyload.js.jsp
        //'ui.grid',
        'validation',
        'kcd.directives'
    ]);

})();


