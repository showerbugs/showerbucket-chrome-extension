(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarImportFileBiz', CalendarImportFileBiz);


    /* @ngInject */
    function CalendarImportFileBiz(ApiConfigUtil, flowFactory) {
        //캘린더 import에는 오직 등록만 있으므로 FlowTempFileBizBuilder는 쓰지 않는다.
        //
        function initFlow() {
            return flowFactory.create({
                singleFile: true,
                allowDuplicateUploads: true
            });
        }

        return {
            getFlow: function(calendarId) {
                var flowObj = initFlow();
                flowObj.opts.target = ApiConfigUtil.wasContext() + '/calendars/' + calendarId + '/import';
                return flowObj;
            }
        };
    }

})();
