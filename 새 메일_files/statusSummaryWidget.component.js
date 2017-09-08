(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('statusSummaryWidget', {
            templateUrl: 'modules/project/view/dashBoard/widget/statusSummaryWidget/statusSummaryWidget.html',
            controller: statusSummaryWidget,
            bindings: {
                toBox: '@'
            }
        });

    /* @ngInject */
    function statusSummaryWidget($scope, CountResource, Project, DashBoardIndicator, ProjectDashBoardService, StateParamsUtil, RootScopeEventBindHelper) {
        var $ctrl = this;

        //PreDefined Callback;

        $ctrl.goFilterList = goFilterList;

        this.$onInit = function () {
            fetchIndicator();
        };

        function goFilterList(colData) {
            ProjectDashBoardService.goFilterList(colData);
        }

        function fetchIndicator() {
            if($ctrl.toBox) {
                _fetchMyTask();
            } else {
                _fetchProject();
            }
        }

        function _fetchMyTask() {
            return CountResource.get({service: 'project', fields: 'workflow,dueDate'}).$promise.then(function (result) {
                $ctrl.indicator = DashBoardIndicator.setIndicatorValue(result.contents().counts);
            });
        }

        function _fetchProject() {
            return Project.fetchByCode(StateParamsUtil.getProjectCodeFilter(), Project.PARAM_NAMES.EXT_FIELDS.COUNTS).then(function (result) {
                $ctrl.indicator = DashBoardIndicator.setIndicatorValue(result.contents().counts, 'postCount');
            });
        }

        RootScopeEventBindHelper.withScope($scope)
            .on(Project.EVENTS.RESETCACHE, fetchIndicator);

    }

})();
