(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('ScheduleTempSaveStorage', ScheduleTempSaveStorage);

    /* @ngInject */
    function ScheduleTempSaveStorage(MyCryptoJSStorage, TempSaveStorageService) {
        var TEMPSAVE_SCHEDULES_EVENTS_NEW_PREFIX_KEY = 'dooray.tempsave.schedules.events.new',
            TEMPSAVE_SCHEDULES_EVENTS_UPDATE_PREFIX_KEY = 'dooray.tempsave.schedules.events.update';

        // Public API here
        return {

            getCommentNew: function (parentScheduleId) {
                return MyCryptoJSStorage.get(TempSaveStorageService.createStoragekeyMap(TEMPSAVE_SCHEDULES_EVENTS_NEW_PREFIX_KEY, parentScheduleId).dataKey) || null;
            },

            removeCommentNew: function (parentScheduleId) {
                TempSaveStorageService.removeStorage(TEMPSAVE_SCHEDULES_EVENTS_NEW_PREFIX_KEY, parentScheduleId);
            },

            saveCommentNew: function (parentScheduleId, commentForm, tmpFileIdList) {
                TempSaveStorageService.rotateSaveStorage(TEMPSAVE_SCHEDULES_EVENTS_NEW_PREFIX_KEY, parentScheduleId, commentForm, tmpFileIdList);
            },

            saveCommentUpdate: function (parentScheduleId, eventId, commentForm, tmpFileIdList) {
                TempSaveStorageService.rotateSaveStorage(TEMPSAVE_SCHEDULES_EVENTS_UPDATE_PREFIX_KEY, parentScheduleId + '-' + eventId, commentForm, tmpFileIdList);
            },

            getCommentUpdate: function (parentScheduleId, eventId) {
                return MyCryptoJSStorage.get(TempSaveStorageService.createStoragekeyMap(TEMPSAVE_SCHEDULES_EVENTS_UPDATE_PREFIX_KEY, parentScheduleId + '-' + eventId).dataKey) || null;
            },

            removeCommentUpdate: function (parentScheduleId, eventId) {
                TempSaveStorageService.removeStorage(TEMPSAVE_SCHEDULES_EVENTS_UPDATE_PREFIX_KEY, parentScheduleId + '-' + eventId);
            }
        };
    }

})();
