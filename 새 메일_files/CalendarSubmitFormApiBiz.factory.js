(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarSubmitFormApiBiz', CalendarSubmitFormApiBiz);

    /* @ngInject */
    function CalendarSubmitFormApiBiz(CalendarScheduleResource) {
        return {
            fetch: function (calendarId, scheduleId) {
                return CalendarScheduleResource.get({
                    scheduleId: scheduleId
                }).$promise;
            },

            save: function (form) {
                return CalendarScheduleResource.save([form]).$promise;
            },

            update: function (form) {
                return CalendarScheduleResource.update({
                    scheduleId: form.id,
                    updateType: form.updateType
                }, form).$promise.then(function (result) {
                        return setIdAndVersion(form, result);
                    });
            }
        };
    }

    function setIdAndVersion(submitForm, result) {
        result = result[0] || result;
        submitForm.id = result.id;
        submitForm.version = result.version;
        return result;
    }

})();
