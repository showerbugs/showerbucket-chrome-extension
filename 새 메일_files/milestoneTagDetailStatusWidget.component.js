(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('milestoneTagDetailStatusWidget', {
            templateUrl: 'modules/project/view/dashBoard/widget/detailStatusWidget/milestoneTagDetailStatusWidget/milestoneTagDetailStatusWidget.html',
            controller: MilestoneTagDetailStatusWidget,
            bindings: {
                tagList: '<',
                milestoneStatus: '<'
            },
            require: {
                detail: '^detailStatusWidget'
            }
        });

    /* @ngInject */
    function MilestoneTagDetailStatusWidget(MilestoneBiz, StateParamsUtil, _) {
        var $ctrl = this;

        //PreDefined Callback;

        this.$onInit = function () {
            $ctrl.detail.fetchTagForMultiSelect();
            fetchMilestonesWithTagCount();
        };

        this.$onChanges = function (changes) {
            if(changes.milestoneStatus || changes.tagList) {
                filterMilestoneList();
            }
        };

        function fetchMilestonesWithTagCount() {
            return MilestoneBiz.getMilestones(StateParamsUtil.getProjectCodeFilter(), {extFields: 'tagCount'}).then(function (result) {
                //TODO: 서비스로 빼기
                _.forEach(result.contents(), function (milestone) {
                    milestone._getOrSetProp('tagCountMap', _.cloneDeep(result.references().tagMap));
                    _.forEach(milestone.counts.tagCount, function (tagMetaData) {
                        _.set(milestone._getOrSetProp('tagCountMap')[tagMetaData.tagId], '_props.count', tagMetaData.count);
                    });
                });

                $ctrl.milestoneList = result.contents();
                filterMilestoneList();
                return result.contents();
            });
        }

        function filterMilestoneList() {
            $ctrl.filteredMilestoneList = $ctrl.milestoneStatus === 'open' ? _.filter($ctrl.milestoneList, {'status': 'open'}) : $ctrl.milestoneList;
        }
        //TODO IMPLEMENTS

    }

})();
