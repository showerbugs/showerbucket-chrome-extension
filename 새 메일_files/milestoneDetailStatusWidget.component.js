(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('milestoneDetailStatusWidget', {
            templateUrl: 'modules/project/view/dashBoard/widget/detailStatusWidget/milestoneDetailStatusWidget/milestoneDetailStatusWidget.html',
            controller: MilestoneDetailStatusWidget,
            bindings: {
                milestoneStatus: '<'

            },
            require: {
                detail: '^detailStatusWidget'
            }
        });

    /* @ngInject */
    function MilestoneDetailStatusWidget($scope, MilestoneBiz, StateParamsUtil, DashBoardIndicator, RootScopeEventBindHelper) {
        var $ctrl = this;

        //PreDefined Callback;

        this.$onInit = function () {
            fetchMilestones();
        };

        this.$onChanges = function (changes) {
            if(changes.milestoneStatus) {
                filterMilestoneList();
            }
        };

        this.$onDestroy = function () {
        };

        function fetchMilestones() {
            return MilestoneBiz.getMilestones(StateParamsUtil.getProjectCodeFilter(), {extFields: 'stat'}).then(function (result) {
                $ctrl.milestoneList = DashBoardIndicator.setNotClosedCount(result.contents(), 'counts.postCount');
                filterMilestoneList();
                return result;
            });
        }

        function filterMilestoneList() {
            $ctrl.filteredMilestoneList = $ctrl.milestoneStatus === 'open' ? _.filter($ctrl.milestoneList, {'status': 'open'}) : $ctrl.milestoneList;
        }

        RootScopeEventBindHelper.on($scope, MilestoneBiz.EVENTS.RESETCACHE, fetchMilestones);
    }

})();
