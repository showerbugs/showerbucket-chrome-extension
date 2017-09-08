(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .service('HelperUrlUtil', HelperUrlUtil);

    /* @ngInject */
    function HelperUrlUtil($state, POPUP_STATE_NAMES, PROJECT_STATE_NAMES, _) {

        return {
            //params = { projectCode: ${CODE}, postNumber : ${NUMBER} };
            makeProjectBoxUrl: function (params, stateOptions) {
                var stateName = (/^@\w+/.test(params.projectCode)) ? PROJECT_STATE_NAMES.TO_BOX_VIEW : PROJECT_STATE_NAMES.PROJECT_BOX_VIEW;
                return $state.href(stateName, params, stateOptions);
            },

            //params = { projectCode: ${CODE}, postNumber : ${NUMBER} };
            makeProjectPopupUrl: function (params) {
                return $state.href(POPUP_STATE_NAMES.TASK_VIEW, params);
            },

            //params = { folderId: ${FOLDERID}, mailId : ${MAILID} };
            makeMailPopupUrl: function (params) {
                return $state.href(POPUP_STATE_NAMES.MAIL_VIEW, params);
            },

            //params = { folderId: ${FOLDERID}, mailId : ${MAILID} };
            makeMailWritePopupUrl: function (type, params) {
                var stateNameMap = {
                    'new': POPUP_STATE_NAMES.MAIL_WRITE_NEW,
                    'draft': POPUP_STATE_NAMES.MAIL_WRITE_DRAFT
                };
                var stateName = stateNameMap[type] || POPUP_STATE_NAMES.MAIL_WRITE_OTHERS;
                params = (stateName === POPUP_STATE_NAMES.MAIL_WRITE_OTHERS) ? _.assign({type: type}, params) : params;
                return $state.href(stateName, params);
            },

            //params = { projectCode: ${CODE}, postNumber : ${NUMBER} };
            makeTaskWritePopupUrl: function (type, params, stateOptions) {
                var stateNameMap = {
                    'new': POPUP_STATE_NAMES.TASK_WRITE_NEW,
                    'draft': POPUP_STATE_NAMES.TASK_WRITE_DRAFT,
                    'update': POPUP_STATE_NAMES.TASK_WRITE_UPDATE,
                    'newsub': POPUP_STATE_NAMES.TASK_WRITE_NEWSUB
                };
                var stateName = stateNameMap[type];
                return $state.href(stateName, params, stateOptions);
            },

            //params = { projectCode: ${CODE}, templateId : ${TEMPLATE_ID} };
            makeTaskTemplateWritePopupUrl: function (params) {
                return $state.href(POPUP_STATE_NAMES.TASK_TEMPLATE_WRITE, params);
            },

            //params = { calendarId: ${CALENDAR_ID}, scheduleId : ${SCHEDULE_ID} };
            makeCalendarWritePopupUrl: function (type, params) {
                var stateNameMap = {
                    'new': POPUP_STATE_NAMES.CALENDAR_WRITE_NEW,
                    'update': POPUP_STATE_NAMES.CALENDAR_WRITE_UPDATE
                };
                var stateName = stateNameMap[type];
                return $state.href(stateName, params);
            },

            makeTranslatorPopupUrl: function (params) {
                return $state.href(POPUP_STATE_NAMES.TRANSLATOR, params);
            }
        };
    }

})();
