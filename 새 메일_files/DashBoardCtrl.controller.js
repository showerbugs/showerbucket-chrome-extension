(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .controller('DashBoardCtrl', DashBoardCtrl);

    /* @ngInject */
    function DashBoardCtrl($q, $scope, CountResource, DashBoardIndicator, DigestService, MyInfo, MessageModalFactory, MilestoneBiz, PermissionFactory, PopupUtil, Project, ProjectMemberBiz, RootScopeEventBindHelper, StateParamsUtil, TagBiz, ProjectDashBoardMetaDataFactory, ProjectDashBoardService, TaskTemplateApiBiz, gettextCatalog, _) {
        var milestones = {
            withStat: {
                all: [],
                open: []
            },
            withTaskCount: {
                all: [],
                open: []
            }
        };
        var unbindEventListener = angular.noop;

        $scope.scrollVersion = 1;
        $scope.title = '';
        $scope.indicator = {};
        $scope.organization = {id: 'all'};
        $scope.organizationList = [{id: 'all', name: gettextCatalog.getString('전체')}];
        $scope.projectList = [];
        $scope.projectMembers = [];
        $scope.detailStatWidgetColumnList = [];
        $scope.isShowOpenMilestone = true;
        $scope.listSortType = '';
        $scope.listSortReverse = true;
        $scope.projectCode = StateParamsUtil.getProjectCodeFilter();
        $scope.DETAIL_STAT_MAP = ProjectDashBoardMetaDataFactory.DETAIL_STAT_MAP;
        $scope.DETAIL_STATUS_LIST = ProjectDashBoardMetaDataFactory.DETAIL_STATUS_LIST;
        $scope.tags = {
            inDetailWidget: []
        };
        $scope.tagGroups = {
            inTagWidget: [],
            inDetailWidget: []
        };
        $scope.milestones = {
            status: 'open',
            inDetailWidget: []
        };
        $scope.detailStatWidget = {
            list: ProjectDashBoardService.getSelectDetailStatList(),
            model: ProjectDashBoardService.getSelectDetailStatList()[0] || $scope.DETAIL_STAT_MAP.PROJECT_STATUS
        };

        $scope.goStateWith = ProjectDashBoardService.goStateWith;
        $scope.openSettings = ProjectDashBoardService.openSettings;
        $scope.sortWithEmpty = sortWithEmpty;
        $scope.getCountDataPath = getCountDataPath;
        $scope.getStatusData = getStatusData;
        $scope.goFilterList = goFilterList;
        $scope.sortList = sortList;
        $scope.setMilestoneStatus = setMilestoneStatus;
        $scope.openSelectTagPane = openSelectTagPane;
        $scope.selectTagItem = selectTagItem;
        $scope.changeOrgId = changeOrgId;
        $scope.isProjectAdmin = isProjectAdmin;

        function sortWithEmpty(data) {
            return _.get(data, $scope.listSortType, 0);
        }

        function getCountDataPath(colData) {
            return ProjectDashBoardService.getCountDataPath($scope.detailStatWidget.model.code, colData);
        }

        function getStatusData(colData, rowData) {
            var value = _.get(rowData, getCountDataPath(colData), 0);
            return Math.min(value, 999);
        }

        function goFilterList(colData, rowData) {
            ProjectDashBoardService.goFilterList(colData, $scope.detailStatWidget.model.code, rowData);
        }

        function sortList(colData) {
            var dataPath = getCountDataPath(colData);
            if ($scope.listSortType !== dataPath) {
                $scope.listSortReverse = true;
                $scope.listSortType = dataPath;
            } else {
                $scope.listSortReverse = !$scope.listSortReverse;
            }
        }

        function setMilestoneStatus() {
            var target = $scope.detailStatWidget.model === $scope.DETAIL_STAT_MAP.MILESTONE_STATUS ? 'withStat' : 'withTaskCount';
            $scope.milestones.inDetailWidget = milestones[target][$scope.milestones.status];
        }

        function openSelectTagPane() {
            fetchTagGroupsForDetailWidget();
        }

        function selectTagItem(tag) {
            if ($scope.tags.inDetailWidget.length < 6) {
                _.find($scope.tagGroups.inDetailWidget, {'id': tag.id})._ticked = true;
                MessageModalFactory.alert(gettextCatalog.getString('6개 이상의 태그를 선택해 주세요.'));
                return;
            }

            TagBiz.applyIcon(tag, $scope.tagGroups.inDetailWidget);
        }

        function changeOrgId() {
            fetchMyProjectList($scope.organization.id);
        }



        function isProjectAdmin() {
            return PermissionFactory.isProjectAdmin();
        }

        function init() {
            //if ($scope.taskContentsCtrl.isToBox()) {
            //    //fetchMyTask();
            //    fetchOrganization();
            //    fetchMyProjectList().then(function () {
            //        DigestService.safeGlobalDigest();
            //        $scope.scrollVersion += 1;
            //    });
            //    RootScopeEventBindHelper.withScope($scope).on(Project.EVENTS.RESETCACHE, function () {
            //        fetchMyProjectList();
            //    });
            //    return;
            //}
            //
            //$q.all([fetchMilestones()]).then(function () {
            //    DigestService.safeGlobalDigest();
            //    $scope.scrollVersion += 1;
            //});
            //
            //RootScopeEventBindHelper.withScope($scope)
            //    //.on(Project.EVENTS.RESETCACHE, fetchProject)
            //    .on(MilestoneBiz.EVENTS.RESETCACHE, fetchMilestones);
        }


        function fetchMilestones() {
            return MilestoneBiz.getMilestones(StateParamsUtil.getProjectCodeFilter(), {extFields: 'stat'}).then(function (result) {
                milestones.withStat.all = DashBoardIndicator.setNotClosedCount(result.contents(), 'counts.postCount');
                milestones.withStat.open = _.filter(milestones.withStat.all, {'status': 'open'});
                $scope.targetMilestone = ProjectDashBoardService.getCloseToEndMilestoneChartData(milestones.withStat.open);
                setMilestoneStatus();
                $scope.scrollVersion += 1;
                return result;
            });
        }

        // totalStat widget
        //
        //function fetchMyTask() {
        //    return CountResource.get({service: 'project', fields: 'workflow,dueDate'}).$promise.then(function (result) {
        //        $scope.indicator = DashBoardIndicator.setIndicatorValue(result.contents().counts);
        //        $scope.scrollVersion += 1;
        //    });
        //}
        //
        //function fetchProject() {
        //    return Project.fetchByCode(StateParamsUtil.getProjectCodeFilter(), Project.PARAM_NAMES.EXT_FIELDS.COUNTS).then(function (result) {
        //        $scope.currentProject = result.contents();
        //        $scope.indicator = DashBoardIndicator.setIndicatorValue(result.contents().counts, 'postCount');
        //    });
        //}

        // detailStat widget

        function fetchOrganization() {
            return MyInfo.getMyOrgList().then(function (myOrgList) {
                $scope.organizationList = $scope.organizationList.concat(myOrgList);
                $scope.scrollVersion += 1;
            });
        }

        function fetchMyProjectList(organizationId) {
            return Project.fetchMyActiveList(organizationId, Project.PARAM_NAMES.EXT_FIELDS.COUNTS).then(function (result) {
                $scope.projectList = DashBoardIndicator.setNotClosedCount(result.contents());
                $scope.scrollVersion += 1;
            });
        }

        function fetchProjectMemberList() {
            return ProjectMemberBiz.fetchListByCode(StateParamsUtil.getProjectCodeFilter(), 'counts').then(function (result) {
                $scope.projectMembers = DashBoardIndicator.setNotClosedCount(result.contents());
                $scope.scrollVersion += 1;
            });
        }

        function fetchTagsInDetailWidget() {
            return TagBiz.getTagWithPrefixesForSetting(StateParamsUtil.getProjectCodeFilter(), 'counts').then(function (result) {
                $scope.tags.inDetailWidget = DashBoardIndicator.setNotClosedCount(result.contents(), 'counts.postCount');
                $scope.scrollVersion += 1;
            });
        }

        function fetchTagGroupsForDetailWidget() {
            return TagBiz.getTagsForMultiSelect(StateParamsUtil.getProjectCodeFilter(), _.map($scope.tags.inDetailWidget, 'id'), { defaultTickCount: 6 }).then(function (tagGroups) {
                $scope.tagGroups.inDetailWidget = tagGroups;
            });
        }

        function fetchMilestonesWithTagCount() {
            return MilestoneBiz.getMilestones(StateParamsUtil.getProjectCodeFilter(), {extFields: 'tagCount'}).then(function (result) {
                _.forEach(result.contents(), function (milestone) {
                    milestone._getOrSetProp('tagCountMap', _.cloneDeep(result.references().tagMap));
                    _.forEach(milestone.counts.tagCount, function (tagMetaData) {
                        _.set(milestone._getOrSetProp('tagCountMap')[tagMetaData.tagId], '_props.count', tagMetaData.count);
                    });
                });

                milestones.withTaskCount.all = result.contents();
                milestones.withTaskCount.open = _.filter(result.contents(), {'status': 'open'});
                setMilestoneStatus();
                $scope.scrollVersion += 1;
                return result.contents();
            });
        }

        function fetchMilestoneTag() {
            $scope.tags.inDetailWidget.length = 0;
            return $q.all([fetchMilestonesWithTagCount(), fetchTagGroupsForDetailWidget()]);
        }

        function fetchDetailStatWidget(model) {
            unbindEventListener();
            unbindEventListener = angular.noop;
            $scope.listSortType = getCountDataPath('notClosed');
            if (model === $scope.DETAIL_STAT_MAP.PROJECT_MEMBER_STATUS) {
                unbindEventListener = RootScopeEventBindHelper.on($scope, ProjectMemberBiz.EVENTS.RESETCACHE, fetchProjectMemberList);
                return fetchProjectMemberList();
            }

            if (model === $scope.DETAIL_STAT_MAP.TAG_STATUS) {
                unbindEventListener = RootScopeEventBindHelper.on($scope, TagBiz.EVENTS.RESETCACHE, fetchTagsInDetailWidget);
                return fetchTagsInDetailWidget();
            }

            if (model === $scope.DETAIL_STAT_MAP.MILESTONE_STATUS) {
                return fetchMilestones().then(function () {
                    $scope.milestones.status = 'open';
                    $scope.scrollVersion += 1;
                });
            }

            if (model === $scope.DETAIL_STAT_MAP.MILESTONE_TAG) {
                $scope.listSortType = getCountDataPath('info');
                $scope.milestones.status = 'open';
                var unbindMilestoneEvent = RootScopeEventBindHelper.on($scope, TagBiz.EVENTS.RESETCACHE, fetchMilestoneTag),
                    unbindTagEvent = RootScopeEventBindHelper.on($scope, MilestoneBiz.EVENTS.RESETCACHE, fetchMilestoneTag);
                unbindEventListener = function () {
                    unbindMilestoneEvent();
                    unbindTagEvent();
                };
                return fetchMilestoneTag();
            }
            return $q.reject();
        }

        var detailWidgetWatchHandler = $scope.$watch('detailStatWidget.model', function (val) {
            if (val) {
                fetchDetailStatWidget(val).then(function () {
                    DigestService.safeGlobalDigest();
                    $scope.scrollVersion += 1;
                });
            }
        });

        $scope.$on('$destroy', function () {
            detailWidgetWatchHandler();
        });

        init();
    }

})();
