(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('InlineEditFormBuilder', InlineEditFormBuilder);

    /* @ngInject */
    function InlineEditFormBuilder() {
        return angular.element.inherit({
            __constructor: function (type, label) {
                this.type = type;
                this.label = label;
            },
            show: angular.noop,
            hasChanged: angular.noop,
            focus: angular.noop,
            cancel: angular.noop,
            withShow: function (callback) {
                this.show = callback;
                return this;
            },
            withHasChanged: function (callback) {
                this.hasChanged = callback;
                return this;
            },
            withCancel: function (callback) {
                this.cancel = callback;
                return this;
            },
            withCreateSubmitData: function (callback) {
                this.createSubmitData = callback;
                return this;
            },
            withSubmit: function (callback) {
                this.submit = callback;
                return this;
            },
            withFocus: function (callback) {
                this.focus = callback;
                return this;
            },
            withGetTwice: function () {
                this.getTwice = true;
                return this;
            },
            build: function () {
                return this;
            }
        });
    }

})();
