(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('movePostsMilestoneOption', {
            templateUrl: 'modules/project/modals/MovePostsModal/movePostsMilestoneOption/movePostsMilestoneOption.html',
            controller: MovePostsMilestoneOption,
            bindings: {
                projectCode: '<',
                fromMilestoneDetail: '<',
                milestoneMapList: '<'
            }
        });

    /* @ngInject */
    function MovePostsMilestoneOption(MilestoneBiz, gettextCatalog) {
        var $ctrl = this;

        this.$onInit = function () {
        };

        this.$onChanges = function () {
            if ($ctrl.projectCode) {
                _fetchMilestones();
            }
        };

        this.filterRule = MilestoneBiz.getMilestoneTabFilterRule('open');
        this.changeMilestonesFilterRule = changeMilestonesFilterRule;

        function _fetchMilestones() {
            MilestoneBiz.getMilestonesForDropdown($ctrl.projectCode).then(function (result) {
                $ctrl.milestoneList = result.contents();
                $ctrl.milestoneList.splice(0, 1, {
                    _displayName: gettextCatalog.getString('선택 안 함'),
                    name: gettextCatalog.getString('선택 안 함'),
                    id: 'none'
                });
            });
        }

        function changeMilestonesFilterRule(status) {
            $ctrl.filterRule = MilestoneBiz.getMilestoneTabFilterRule(status);
            $ctrl.openMilestoneTabIndex = status === 'open' ? 0 : 1;
        }
    }

})();
