(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('TranslationStorageAction', TranslationStorageAction);

    /* @ngInject */
    function TranslationStorageAction($timeout, HelperConfigUtil, HelperLocaleUtil, localStorage) {
        var MAX_POST_INFO_SIZE = 100,
            VERSION = 1,
            POST_TRANSLATION_INFO_KEY = 'postTranslationInfo',
            isFetched = false,
            postIdList = [],
            postTranslationInfo = {};

        return {
            getDefaultTranslation: getDefaultTranslation,
            savePostTranslationInfo: savePostTranslationInfo,
            loadPostTranslationInfo: loadPostTranslationInfo,
            removePostTranslationInfo: removePostTranslationInfo
        };

        function getDefaultTranslation() {
            var locale = HelperConfigUtil.locale() || HelperLocaleUtil.defaultLanguage();
            return {
                sourceLang: 'auto',
                targetLang: locale.substr(0, 2)
            };
        }

        function savePostTranslationInfo(postId, translationInfo) {
            _removeInfo(postId);
            postIdList.push(postId);
            postTranslationInfo[postId] = translationInfo;

            if (MAX_POST_INFO_SIZE < postIdList.length) {
                _removeInfo(postIdList.shift());
            }
            _saveToStorage();
        }

        function loadPostTranslationInfo(postId) {
            _fetchFromStorage();
            return postTranslationInfo[postId];
        }

        function removePostTranslationInfo(postId) {
            _removeInfo(postId);
            _saveToStorage();
        }

        function _removeInfo(postId) {
            var index = postIdList.indexOf(postId);
            if (index > -1) {
                postIdList.splice(index, 1);
            }
            delete postTranslationInfo[postId];
        }

        function _saveToStorage() {
            $timeout(function () {
                localStorage.setItem(POST_TRANSLATION_INFO_KEY, angular.toJson({
                    list: postIdList,
                    map: postTranslationInfo,
                    version: VERSION
                }));
            }, 0, false);
        }

        function _fetchFromStorage() {
            if (isFetched) {
                return;
            }
            var result = localStorage.getItem(POST_TRANSLATION_INFO_KEY);
            if (!result) {
                return;
            }
            result = angular.fromJson(result);
            postIdList = result.list;
            postTranslationInfo = result.map;
            isFetched = true;
        }
    }

})();
