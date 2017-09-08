(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('PostTempSaveStorage', PostTempSaveStorage);

    /* @ngInject */
    function PostTempSaveStorage(MyCryptoJSStorage, TempSaveStorageService) {
        var TEMPSAVE_POSTS_NEW_PREFIX_KEY = 'dooray.tempsave.tasks.new',
            TEMPSAVE_POSTS_UPDATE_PREFIX_KEY = 'dooray.tempsave.tasks.update',
            TEMPSAVE_POSTS_EVENTS_NEW_PREFIX_KEY = 'dooray.tempsave.tasks.events.new',
            TEMPSAVE_POSTS_EVENTS_UPDATE_PREFIX_KEY = 'dooray.tempsave.tasks.events.update';

        // Public API here
        return {
            saveItemNew: function (taskForm, tmpFileIdList) {
                TempSaveStorageService.rotateSaveStorage(TEMPSAVE_POSTS_NEW_PREFIX_KEY, taskForm.projectCode, taskForm, tmpFileIdList);
            },

            getItemNew: function (projectCode) {
                return MyCryptoJSStorage.get(TempSaveStorageService.createStoragekeyMap(TEMPSAVE_POSTS_NEW_PREFIX_KEY, projectCode).dataKey) || null;
            },

            removeItemNew: function (projectCode) {
                TempSaveStorageService.removeStorage(TEMPSAVE_POSTS_NEW_PREFIX_KEY, projectCode);
            },

            saveItemUpdate: function (taskForm, tmpFileIdList) {
                TempSaveStorageService.rotateSaveStorage(TEMPSAVE_POSTS_UPDATE_PREFIX_KEY, taskForm.id, taskForm, tmpFileIdList);
            },

            getItemUpdate: function (postId) {
                return MyCryptoJSStorage.get(TempSaveStorageService.createStoragekeyMap(TEMPSAVE_POSTS_UPDATE_PREFIX_KEY, postId).dataKey) || null;
            },

            removeItemUpdate: function (postId) {
                TempSaveStorageService.removeStorage(TEMPSAVE_POSTS_UPDATE_PREFIX_KEY, postId);
            },

            saveCommentNew: function (parentTaskId, commentForm, tmpFileIdList) {
                TempSaveStorageService.rotateSaveStorage(TEMPSAVE_POSTS_EVENTS_NEW_PREFIX_KEY, parentTaskId, commentForm, tmpFileIdList);
            },

            getCommentNew: function (parentTaskId) {
                return MyCryptoJSStorage.get(TempSaveStorageService.createStoragekeyMap(TEMPSAVE_POSTS_EVENTS_NEW_PREFIX_KEY, parentTaskId).dataKey) || null;
            },

            removeCommentNew: function (parentTaskId) {
                TempSaveStorageService.removeStorage(TEMPSAVE_POSTS_EVENTS_NEW_PREFIX_KEY, parentTaskId);
            },

            saveCommentUpdate: function (parentTaskId, eventId, commentForm, tmpFileIdList) {
                TempSaveStorageService.rotateSaveStorage(TEMPSAVE_POSTS_EVENTS_UPDATE_PREFIX_KEY, parentTaskId + '-' + eventId, commentForm, tmpFileIdList);
            },

            getCommentUpdate: function (parentTaskId, eventId) {
                return MyCryptoJSStorage.get(TempSaveStorageService.createStoragekeyMap(TEMPSAVE_POSTS_EVENTS_UPDATE_PREFIX_KEY, parentTaskId + '-' + eventId).dataKey) || null;
            },

            removeCommentUpdate: function (parentTaskId, eventId) {
                TempSaveStorageService.removeStorage(TEMPSAVE_POSTS_EVENTS_UPDATE_PREFIX_KEY, parentTaskId + '-' + eventId);
            }
        };
    }

})();
