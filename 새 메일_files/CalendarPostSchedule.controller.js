(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .controller('CalendarPostScheduleModalCtrl', CalendarPostScheduleModalCtrl);

    /* @ngInject */
    function CalendarPostScheduleModalCtrl($scope, CalendarDetailUrlApiBiz, TaskDisplayHelperFactory, _) {
        var self = this;

        function applyTaskDisplayHelper(task) {
            return new TaskDisplayHelperFactory.AssignDisplayPropertiesBuilder(task)
                .withMemberGroupFilter()
                .withProjectCode()
                .build();
        }

        function fetchTask() {
            var detailUrl = _.get($scope.model, 'raw.detailUrl');
            CalendarDetailUrlApiBiz.fetchDataByUrlParam(detailUrl).then(function (result) {
                self.post = applyTaskDisplayHelper(result.contents());
            });
        }

        function init() {
            fetchTask();
        }

        init();
    }

})();
