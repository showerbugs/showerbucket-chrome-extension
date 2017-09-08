(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('burndownChartWidget', {
            templateUrl: 'modules/project/view/dashBoard/widget/burndownChartWidget/burndownChartWidget.html',
            controller: burndownChartWidget
        });

    /* @ngInject */
    function burndownChartWidget($scope, $timeout, ChartServiceFactory, MilestoneBiz, ProjectDashBoardService, RootScopeEventBindHelper, EMIT_EVENTS, StateParamsUtil, _) {
        var $ctrl = this;
        var API_FUNCTION_INITIAL_TIME = 10;

        //PreDefined Callback;

        this.$onInit = function () {
            fetchMilestones();
            $ctrl.api = null;
        };

        this.$onChanges = function () {
        };

        this.$onDestroy = function () {
        };


        function _refreshChart() {
            _.result($ctrl.a.api, 'refresh');
        }

        function initChart() {
            RootScopeEventBindHelper.withScope($scope)
                .on(EMIT_EVENTS.RESIZE_NAVI, _refreshChart)
                .on(EMIT_EVENTS.RESIZE_VIEW, _refreshChart);

            $timeout(function () {
                if (!$ctrl.api) {
                    return;
                }
                ChartServiceFactory.milestone.reloadChart($ctrl.api, $ctrl.data);
            }, API_FUNCTION_INITIAL_TIME, false);
        }

        function fetchMilestones() {
            return MilestoneBiz.getMilestones(StateParamsUtil.getProjectCodeFilter(), {extFields: 'stat'}).then(function (result) {
                $ctrl.milestone = ProjectDashBoardService.getCloseToEndMilestoneChartData(_.filter(result.contents(), {'status': 'open'}));
                $ctrl.data = ChartServiceFactory.milestone.getChartData($ctrl.milestone);
                $ctrl.options = ChartServiceFactory.milestone.getDefaultOptions($ctrl.milestone, $ctrl.data);
                //console.log($ctrl.data, $ctrl.options);
                initChart();
                return result;
            });
        }
    }

})();
