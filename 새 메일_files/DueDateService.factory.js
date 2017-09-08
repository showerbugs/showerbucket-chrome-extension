(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('DueDateService', DueDateService);

    /* @ngInject */
    function DueDateService(moment) {
        var DUE_DATE_DATE_FORMAT = 'YYYY.MM.DD (dd)',
            TIME_FORMAT = 'HH:mm',
            DUE_DATE_MODES = {
                ENABLED: 'enabled',
                UNPLANNED: 'unplanned',
                NONE: 'none'
            };
        return {
            DUE_DATE_MODES: DUE_DATE_MODES,
            calcDueDateMode: calcDueDateMode,
            convertReadableDueDate: convertReadableDueDate
        };

        function calcDueDateMode(dueDate, dueDateFlag) {
            if (!dueDateFlag) {
                return DUE_DATE_MODES.NONE;
            }
            return dueDate ? DUE_DATE_MODES.ENABLED : DUE_DATE_MODES.UNPLANNED;
        }

        function convertReadableDueDate(dueDate) {
            if (dueDate) {
                return [moment(dueDate).format(DUE_DATE_DATE_FORMAT), moment(dueDate).format(TIME_FORMAT)].join(' ');
            }
        }
    }

})();
