(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .factory('TranslationStorageBuilder', TranslationStorageBuilder);

    /* @ngInject */
    function TranslationStorageBuilder($timeout, localStorage) {
        return angular.element.inherit({
            __constructor: function (key) {
                this.reset(key);
            },
            reset: function (key) {
                this._maxSize = 100;
                this._version = 1;
                this._key = key;
                this._isFetched = false;
                this.idList = [];
                this.translationInfo = {};
            },
            saveTranslationInfo: function (id, translationInfo) {
                this._removeInfo(id);
                this.idList.push(id);
                this.translationInfo[id] = translationInfo;

                if (this._maxSize < this.idList.length) {
                    this._removeInfo(this.idList.shift());
                }
                this._saveToStorage();
            },
            loadTranslationInfo: function (id) {
                this._fetchFromStorage();
                return this.translationInfo[id];
            },
            removeTranslationInfo: function (id) {
                this._removeInfo(id);
                this._saveToStorage();
            },
            _removeInfo: function (id) {
                var index = this.idList.indexOf(id);
                if (index > -1) {
                    this.idList.splice(index, 1);
                }
                delete this.translationInfo[id];
            },
            _saveToStorage: function () {
                var self = this;
                $timeout(function () {
                    localStorage.setItem(self._key, angular.toJson({
                        list: self.idList,
                        map: self.translationInfo,
                        version: self._version
                    }));
                }, 0, false);
            },
            _fetchFromStorage: function () {
                if (this._isFetched) {
                    return;
                }
                var result = localStorage.getItem(this._key);
                if (!result) {
                    return;
                }
                result = angular.fromJson(result);
                this.idList = result.list;
                this.translationInfo = result.map;
                this._isFetched = true;
            }
        });
    }

})();
