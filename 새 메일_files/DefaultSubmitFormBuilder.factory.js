(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('DefaultSubmitFormBuilder', DefaultSubmitFormBuilder);

    /* @ngInject */
    function DefaultSubmitFormBuilder(_) {
        var Constructor = angular.element.inherit({

            __constructor: function () { // constructor
                this._form = this.__self.getDefaultForm();
                this._options = this.__self.getDefaultOption();
            },

            withForm: function (keyOrOptions, value) {
                this._form = this.__self.applyAllOrPart(this._form, keyOrOptions, value);
                this._originalForm = _.cloneDeep((this._form));
                return this;
            },

            form: function (key) {
                return this.__self.getAllOrPart(this._form, key);
            },

            withOption: function (keyOrOptions, value) {
                this._options = this.__self.applyAllOrPart(this._options, keyOrOptions, value);
                return this;
            },

            option: function (key) {
                return this.__self.getAllOrPart(this._options, key);
            },

            build: function (overwriteForm) {
                return this.withForm(overwriteForm);
            }
        }, {
            getDefaultForm: function () {
                return {};
            },
            getDefaultOption: function () {
                return {};
            },

            applyAllOrPart: function (target, keyOrOptions, value) {
                if (_.isObject(keyOrOptions)) {
                    target = _.assign(target, keyOrOptions, {});
                } else if (_.isString(keyOrOptions) && !_.isUndefined(value)) {
                    _.set(target, keyOrOptions, value);
                }
                return target;
            },

            getAllOrPart: function (target, key) {
                return _.isString(key) ? _.get(target, key, null) : target;
            }
        });
        return Constructor;
    }

})();
