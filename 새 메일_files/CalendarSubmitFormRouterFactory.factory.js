(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarSubmitFormRouterFactory', CalendarSubmitFormRouterFactory);

    /* @ngInject */
    function CalendarSubmitFormRouterFactory($q, CalendarSubmitFormApiBiz, CalendarSubmitFormFactory, SUBMIT_FORM_MODES, _) {
        // Public API here
        return {
            'new': function (form, options) {    //캘린더 일정 신규
                return $q.when(CalendarSubmitFormFactory.createNew()
                        .withForm(form)
                        .withOption(_.assign({
                            mode: SUBMIT_FORM_MODES.NEW
                        }, options))
                );
            },

            'update': function (calendarId, scheduleId, updateType) {   //캘린더 일정 수정
                return CalendarSubmitFormApiBiz.fetch(calendarId, scheduleId).then(function (result) {
                    return $q.when(CalendarSubmitFormFactory.createFromDetail(result)
                        .withForm({
                            updateType: updateType
                        })
                        .withOption({
                            mode: SUBMIT_FORM_MODES.UPDATE
                        }));
                });
            }
        };
    }

})();
