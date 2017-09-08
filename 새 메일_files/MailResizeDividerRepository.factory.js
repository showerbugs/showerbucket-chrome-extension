(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .constant('MAIL_SCREEN_MODE', {
            FULL: 'full',
            NORMAL: 'divide'
        })
        .factory('MailResizeDividerRepository', MailResizeDividerRepository);

    /* @ngInject */
    function MailResizeDividerRepository(MAIL_SCREEN_MODE, localStorage, _) {

        var DIVIDER_TYPES = {
                NAVI: 'navi',
                VIEW: 'view'
            },
            dividers = {};

        return {
            DIVIDER_TYPES: DIVIDER_TYPES,
            SCREEN_MODE: MAIL_SCREEN_MODE,
            loadLocalStorage: loadLocalStorage,
            saveLocalStorage: saveLocalStorage,
            setDivider: function (type, divider) {
                dividers[type] = divider;
            },
            getDivider: function (type) {
                return dividers[type];
            },
            removeDivider: function (type) {
                delete dividers[type];
            },
            clear: function () {
                var self = this;
                _.forEach(dividers, function (type) {
                    self.removeDivider(type);
                });
                dividers = {};
            }
        };

        function loadLocalStorage(key) {
            var storage = localStorage.getItem(key);
            return _translatePrevVersionKey(angular.fromJson(storage)) || {};
        }

        function saveLocalStorage(key, object) {
            localStorage.setItem(key, angular.toJson(object));
        }

        function _translatePrevVersionKey(obj) {
            if (!_.isObject(obj)) {
                return;
            }
            obj.size = obj.size || obj.left;
            return obj;
        }
    }

})();
