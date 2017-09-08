(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('detailStatusWidget', {
            templateUrl: 'modules/project/view/dashBoard/widget/detailStatusWidget/detailStatusWidget.html',
            controller: detailStatusWidget,
            bindings: {
                toBox: '@'
            },
            require: {
                dashboard: '^dashBoard'
            }
        });

    /* @ngInject */
    function detailStatusWidget(ProjectDashBoardService, StateParamsUtil, TagBiz, MessageModalFactory, ProjectDashBoardMetaDataFactory, gettextCatalog, _) {
        var $ctrl = this;

        this.$onInit = function () {
            $ctrl.current = {
                stat: ProjectDashBoardService.getSelectDetailStatList()[0] || ProjectDashBoardMetaDataFactory.DETAIL_STAT_MAP.PROJECT_STATUS,
                tagList: [],
                milestones: {
                    status: 'open'
                }
            };
            $ctrl.statList = ProjectDashBoardService.getSelectDetailStatList();
            $ctrl.STAT_MAP = ProjectDashBoardMetaDataFactory.DETAIL_STAT_MAP;
            $ctrl.DETAIL_TASK_STATUS_LIST = ProjectDashBoardMetaDataFactory.DETAIL_TASK_STATUS_LIST;
            sortList('notClosed');
        };

        $ctrl.sortList = sortList;
        $ctrl.sortWithEmpty = sortWithEmpty;
        $ctrl.goStateWith = ProjectDashBoardService.goStateWith;
        $ctrl.goFilterList = goFilterList;
        $ctrl.getStatusData = getStatusData;
        $ctrl.getCountDataPath = getCountDataPath;
        $ctrl.selectTagItem = selectTagItem;
        $ctrl.fetchTagForMultiSelect = fetchTagForMultiSelect;
        $ctrl.resetCurrentValue = resetCurrentValue;

        //TODO: refactoring 필수 (서비스로 빼기)
        function sortList(colData) {
            var dataPath = getCountDataPath(colData);
            if ($ctrl.listSortType !== dataPath) {
                $ctrl.listSortType = dataPath;
                $ctrl.listSortReverse = true;
            } else {
                $ctrl.listSortReverse = !$ctrl.listSortReverse;
            }
        }

        function sortWithEmpty(data) {
            return _.get(data, $ctrl.listSortType, 0);
        }

        function getCountDataPath(colData) {
            return ProjectDashBoardService.getCountDataPath($ctrl.current.stat.code, colData);
        }

        function getStatusData(colData, rowData) {
            var value = _.get(rowData, getCountDataPath(colData), 0);
            return Math.min(value, 999);
        }

        function goFilterList(colData, rowData) {
            ProjectDashBoardService.goFilterList(colData, rowData, $ctrl.current.stat.code);
        }


        function selectTagItem(tag) {
            if ($ctrl.current.tagList.length < 6) {
                _.find($ctrl.tagList, {'id': tag.id})._ticked = true;
                MessageModalFactory.alert(gettextCatalog.getString('6개 이상의 태그를 선택해 주세요.'));
                return;
            }

            TagBiz.applyIcon(tag, $ctrl.tagList);
        }


        function fetchTagForMultiSelect() {
            return TagBiz.getTagsForMultiSelect(StateParamsUtil.getProjectCodeFilter(), _.map($ctrl.current.tagList, 'id'), { defaultTickCount: 6 }).then(function (tagGroups) {
                $ctrl.tagList = tagGroups;
            });
        }

        function resetCurrentValue() {
            $ctrl.current.milestones.status = 'open';
            $ctrl.listSortType = getCountDataPath('notClosed');
            $ctrl.listSortReverse = true;
            if ($ctrl.current.stat.code === $ctrl.STAT_MAP.MILESTONE_TAG_STATUS.code) {
                $ctrl.current.tagList = [];
                //fetchTagForMultiSelect();
            }
        }
    }

})();
