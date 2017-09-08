(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .controller('CalendarMilestoneScheduleModalCtrl', CalendarMilestoneScheduleModalCtrl);

    /* @ngInject */
    function CalendarMilestoneScheduleModalCtrl($scope, $state, PROJECT_STATE_NAMES, CalendarDetailUrlApiBiz, _) {
        var self = this;

        function fetchMilestone() {
            var detailUrl = _.get($scope.model, 'raw.detailUrl'),
                param = {extFields: 'counts'};
            return CalendarDetailUrlApiBiz.fetchDataByUrlParam(detailUrl, param).then(function (result) {
                return self.milestone = result.contents();
            });
        }

        function init() {
            fetchMilestone().then(function(milestone) {
                self.url = $state.href(PROJECT_STATE_NAMES.PROJECT_BOX , {
                    'projectCodeFilter': milestone._wrap.refMap.projectMap(milestone.projectId).code
                });
            });
        }

        init();
    }

})();
