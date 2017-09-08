(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('MyCryptoJSStorage', MyCryptoJSStorage);

    /* @ngInject */
    function MyCryptoJSStorage(CryptoJS, HelperConfigUtil, localStorage) {
        // Service logic
        var STORAGE_VERSION = 1;

        // Public API here
        return {
            get: function (key, version) {
                var value = localStorage.getItem(key), decrypted, result;
                if (value) {
                    try {
                        decrypted = CryptoJS.AES.decrypt(value, HelperConfigUtil.orgMemberId()).toString(CryptoJS.enc.Utf8);
                    } catch (exception) {
                        this.remove(key);
                        return null;
                    }
                }
                if (!decrypted) {
                    return null;
                }
                result = angular.fromJson(decrypted);
                if (result.version !== (version || STORAGE_VERSION)) {
                    this.remove(key);
                    return null;
                }
                delete result.version;
                return result;
            },
            set: function (key, valueObj, version) {
                valueObj.version = version || STORAGE_VERSION;
                var valueStr = angular.toJson(valueObj),
                    encrypted = CryptoJS.AES.encrypt(valueStr, HelperConfigUtil.orgMemberId());
                localStorage.setItem(key, encrypted);
            },

            remove: function (key) {
                localStorage.removeItem(key);
            },

            clear: function () {
                localStorage.clear();
            }
        };
    }

})();
