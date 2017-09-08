(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .service('ProjectDashBoardService', ProjectDashBoardService)
        .factory('ProjectDashBoardMetaDataFactory', ProjectDashBoardMetaDataFactory);

    /* @ngInject */
    function ProjectDashBoardService($state, $stateParams, PROJECT_STATE_NAMES, CommonItemList, DateConvertUtil, ProjectManagementModalFactory, StateParamsUtil, ProjectDashBoardMetaDataFactory, _) {
        var DETAIL_STAT_MAP = ProjectDashBoardMetaDataFactory.DETAIL_STAT_MAP,
            totalStatInfo = ProjectDashBoardMetaDataFactory.totalStatInfo,
            detailStatInfo = ProjectDashBoardMetaDataFactory.detailStatInfo;

        return {
            getCountDataPath: getCountDataPath,
            getSelectDetailStatList: getSelectDetailStatList,
            goStateWith: goStateWith,
            goFilterList: goFilterList,
            getCloseToEndMilestoneChartData: getCloseToEndMilestoneChartData,
            openSettings: openSettings
        };

        function getCountDataPath(detailStatCode, colData) {
            return detailStatInfo[detailStatCode].getDataPath(colData);
        }

        function getSelectDetailStatList() {
            if ($state.includes(PROJECT_STATE_NAMES.PROJECT_BOX)) {
                return [DETAIL_STAT_MAP.PROJECT_MEMBER_STATUS,
                    DETAIL_STAT_MAP.TAG_STATUS,
                    DETAIL_STAT_MAP.MILESTONE_STATUS,
                    DETAIL_STAT_MAP.MILESTONE_TAG_STATUS];
            }
            return [];
        }

        function goStateWith(params) {
            if ($state.includes(PROJECT_STATE_NAMES.PROJECT_BOX)) {
                params.projectCodeFilter = StateParamsUtil.getProjectCodeFilter();
            }
            params.order = $stateParams.order;

            CommonItemList.stateGoWithoutReload('.', params, {inherit: false});
        }

        function goFilterList(colData, rowData, detailStatCode) {
            var boxType = $state.includes(PROJECT_STATE_NAMES.TO_BOX) ? 'toBox' : 'projectBox';
            if (_.isEmpty(rowData)) {
                goStateWith(totalStatInfo[boxType].makeParamMap(colData));
            } else {
                goStateWith(detailStatInfo[detailStatCode].makeParamMap(rowData, colData));
            }
        }

        function getCloseToEndMilestoneChartData(milestones) {
            if (_.isEmpty(milestones) || !milestones[0].endedAt) {
                return;
            }

            // 마일스톤 endedAt이 오늘 이전 것들만 있다면 가장 최근에 종료한 것을 차트로 보여줍니다.
            return _(milestones).filter('endedAt').find(function (milestone) {
                    return DateConvertUtil.isOverDate(moment(milestone.startedAt).startOf('day')) &&
                        !DateConvertUtil.isOverDate(moment(milestone.endedAt).endOf('day'));
                });
        }

        function openSettings(targetTabName, projectCode) {
            if (!targetTabName) { return; }

            if (_.startsWith(targetTabName, 'status')) {
                // targetTabName이 'statusTag' || 'statusMilestone' 인 경우 'status' 삭제
                targetTabName = targetTabName.substring(6);
            }
            var availableTab = ProjectManagementModalFactory.TAB_NAMES[targetTabName.toUpperCase()];
            if (availableTab) {
                ProjectManagementModalFactory.open(projectCode, {activeTabName: availableTab});
            }
        }
    }

    /* @ngInject */
    function ProjectDashBoardMetaDataFactory(gettextCatalog, _) {
        var PARAM_MAP = {
            userWorkflowType: {
                overdue: {userWorkflowClass: 'registered,working', dueDate: 'overdue'},
                notClosed: {userWorkflowClass: 'registered,working'},
                registered: {userWorkflowClass: 'registered'},
                working: {userWorkflowClass: 'working'},
                unplanned: {userWorkflowClass: 'registered,working', dueDate: 'unplanned'},
                closed: {userWorkflowClass: 'closed'}
            },
            taskWorkflowType: {
                overdue: {postWorkflowClass: 'registered,working', dueDate: 'overdue'},
                notClosed: {postWorkflowClass: 'registered,working'},
                registered: {postWorkflowClass: 'registered'},
                working: {postWorkflowClass: 'working'},
                unplanned: {postWorkflowClass: 'registered,working', dueDate: 'unplanned'},
                closed: {postWorkflowClass: 'closed'}
            }
        };

        var DATA_PATH_MAP = {
            userWorkflowType: {
                info: 'name',
                overdue: 'counts.dueDate.overdue',
                notClosed: '_props.notClosedTaskCount',
                registered: 'counts.myPostCount.workflow.registered',
                working: 'counts.myPostCount.workflow.working',
                unplanned: 'counts.dueDate.unplanned',
                closed: 'counts.myPostCount.workflow.closed'
            },
            taskWorkflowType: {
                info: 'name',
                overdue: 'counts.dueDate.overdue',
                notClosed: '_props.notClosedTaskCount',
                registered: 'counts.postCount.workflow.registered',
                working: 'counts.postCount.workflow.working',
                unplanned: 'counts.dueDate.unplanned',
                closed: 'counts.postCount.workflow.closed'
            }
        };

        var DETAIL_STAT_MAP= {
            PROJECT_STATUS: {
                name: gettextCatalog.getString('프로젝트별 현황'),
                code: 'statusProject'
            },
            PROJECT_MEMBER_STATUS: {
                name: gettextCatalog.getString('멤버별 업무현황'),
                code: 'statusProjectMember'
            },
            TAG_STATUS: {
                name: gettextCatalog.getString('태그별 업무현황'),
                code: 'statusTag'
            },
            MILESTONE_STATUS: {
                name: gettextCatalog.getString('마일스톤별 업무현황'),
                code: 'statusMilestone'
            },
            MILESTONE_TAG_STATUS: {
                name: gettextCatalog.getString('마일스톤, 태그별 업무현황'),
                code: 'statusMilestoneTag'
            }
        };

        var DETAIL_TASK_STATUS_LIST = [{
            name: gettextCatalog.getString('등록 + 진행'),
            code: 'notClosed',
            className: 'not-closed'
        }, {
            name: gettextCatalog.getString('등록'),
            code: 'registered',
            className: 'registered'
        }, {
            name: gettextCatalog.getString('진행'),
            code: 'working',
            className: 'working'
        }, {
            name: gettextCatalog.getString('미정'),
            code: 'unplanned',
            className: 'unplanned'
        }, {
            name: gettextCatalog.getString('지연'),
            code: 'overdue',
            className: 'overdue'
        }, {
            name: gettextCatalog.getString('완료'),
            code: 'closed',
            className: 'closed'
        }];

        var TotalStatInfoBuilder = angular.element.inherit({
            paramMap: null,
            makeParamMap: function (status) {
                return this.paramMap[status];
            },
            withParamMap: function (paramMap) {
                this.paramMap = paramMap;
                return this;
            },
            withMakeParamMapFunc: function (makeParamMapFunc) {
                this.makeParamMap = makeParamMapFunc;
                return this;
            }
        });

        var DetailStatInfoBuilder = angular.element.inherit(TotalStatInfoBuilder, {
            paramMap: null,
            dataPath: null,
            makeParamMap: function (project, status) {
                return _.assign({}, this.paramMap[status], {projectCodeFilter: project.code});
            },
            getColList: function () {
                return this.colList;
            },
            getDataPath: function (status) {
                return this.dataPath[status];
            },
            withDataPath: function (dataPath) {
                this.dataPath = dataPath;
                return this;
            },
            withGetDataPathFunc: function (getDataPathFunc) {
                this.getDataPath = getDataPathFunc;
                return this;
            }
        });

        var totalStatInfo = {
            toBox: new TotalStatInfoBuilder()
                .withParamMap(PARAM_MAP.userWorkflowType),
            projectBox: new TotalStatInfoBuilder()
                .withParamMap(PARAM_MAP.taskWorkflowType)
        };

        var detailStatInfo = {
            // 담당업무함
            statusProject: new DetailStatInfoBuilder()
                .withParamMap(PARAM_MAP.userWorkflowType)
                .withDataPath(DATA_PATH_MAP.userWorkflowType),
            // 프로젝트 멤버별 상태
            statusProjectMember: new DetailStatInfoBuilder()
                .withParamMap(PARAM_MAP.userWorkflowType)
                .withDataPath(DATA_PATH_MAP.userWorkflowType)
                .withMakeParamMapFunc(function (member, status) {
                    return _.assign({}, this.paramMap[status], {to: member.id});
                }),
            // 태그별 상태
            statusTag: new DetailStatInfoBuilder()
                .withParamMap(PARAM_MAP.taskWorkflowType)
                .withDataPath(DATA_PATH_MAP.taskWorkflowType)
                .withMakeParamMapFunc(function (tag, status) {
                    return _.assign({}, this.paramMap[status], {tags: 'and,' + tag.id});
                }),
            statusMilestone: new DetailStatInfoBuilder()
                .withParamMap(PARAM_MAP.taskWorkflowType)
                .withDataPath(DATA_PATH_MAP.taskWorkflowType)
                .withMakeParamMapFunc(function (milestone, status) {
                    return _.assign({}, this.paramMap[status], {milestone: milestone.id});
                }),
            statusMilestoneTag: new DetailStatInfoBuilder()
                .withMakeParamMapFunc(function (milestone, tag) {
                    return {milestone: milestone.id, tags: 'and,' + tag.id};
                })
                .withGetDataPathFunc(function (tag) {
                    if (tag === 'info') {
                        return 'name';
                    }
                    return ['_props.tagCountMap["', tag.id, '"]._props.count'].join('');
                })
        };

        return {
            DETAIL_STAT_MAP: DETAIL_STAT_MAP,
            DETAIL_TASK_STATUS_LIST: DETAIL_TASK_STATUS_LIST,
            totalStatInfo: totalStatInfo,
            detailStatInfo: detailStatInfo
        };
    }

})();
