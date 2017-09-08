(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .controller('TaskListCtrl', TaskListCtrl);

    /* @ngInject */
    function TaskListCtrl($scope, $state, $timeout, PROJECT_STATE_NAMES, ApiPageSizeFactory, CommonItemList, DigestService, ListCheckBoxBiz, MilestoneBiz, NoticeSummaryService, NoticeTaskList, RootScopeEventBindHelper, StateParamsUtil, TagBiz, TaskSearchParamStorage, TaskListFilterService, TaskListOrderService, PopupUtil, gettextCatalog, _) {
        $scope.listOrder = TaskListOrderService;
        $scope.PROJECT_STATE_NAMES = PROJECT_STATE_NAMES;

        var loading = {
            list: false,
            notice: false,
            filter: false
        }, disableListener = {
            milestone: angular.noop,
            tags: angular.noop
        };

        var fetchListListener = function () {
            CommonItemList.fetchList();
        };

        // 초기화 부분
        var initStateInfos = function () {
            var stateData = $state.current.data;

            $scope.listItemTemplate = 'modules/project/list/TaskList/verticalSplitListContent/' + stateData.listItemTemplate;
            $scope.noItemMessage = gettextCatalog.getString(stateData.noItemMessage);

            if ($state.includes(PROJECT_STATE_NAMES.PROJECT_BOX)) {
                $scope.isProjectBox = true;

                disableListener.milestone();
                disableListener.tags();
                disableListener.milestone = RootScopeEventBindHelper.on($scope, MilestoneBiz.EVENTS.RESETCACHE, function (event, reason) {
                    if (reason === MilestoneBiz.EVENT_REASON.UPDATE || reason === MilestoneBiz.EVENT_REASON.REMOVE) {
                        fetchListListener();
                    }
                });
                disableListener.tags = RootScopeEventBindHelper.on($scope, TagBiz.EVENTS.RESETCACHE, function (event, reason) {
                    if (reason !== TagBiz.EVENT_REASON.UPDATE_TAG_PREFIX) {
                        fetchListListener();
                    }
                });
            }

            if ($state.includes(PROJECT_STATE_NAMES.MENTION_BOX)) {
                $scope.mentionScope = $state.params.scope;
                $scope.isMentionBox = true;
            }
        };

        var init = function (withoutReload) {
            var param = (TaskListFilterService.hasFilterParam() || $state.params.order || $state.params.projectIds || $state.params.read === 'false') ?
                $state.params : TaskSearchParamStorage.getStoredFilter();
            param = _.assign({}, _.get($state.current, 'data.defaultParams', {}), param);
            $scope.noticeTasks = [];
            $scope.commonList.pagination.init(ApiPageSizeFactory.getListApiSize(), $state.params.page || 1);
            $scope.showFilterMenus = TaskListFilterService.getShowFilterMenus();
            $scope.isMyWorkflowPost = $state.current.data.workflowBadge === 'me';
            initStateInfos();
            TaskListOrderService.data.currentValue = _.get(param, 'order') || $state.current.data.defaultOrder;
            var targetFunc = $state.current.data.isContentList ? CommonItemList.init : TaskListOrderService.init;
            targetFunc();
            var promise = withoutReload ? CommonItemList.fetchList(param) : CommonItemList.stateGoWithoutReload('.', param);
            promise.then(function () {
                // view state에서만 실행
                if ($state.includes('**.view')) {
                    $scope.commonList.scrollToSelectedItem();
                }
            });
        };

        var setReadProperty = function (post, isRead) {
            _.set(post._getOrSetProp('myInfo'), 'member.read', isRead);
        };

        var getReadProperty = function (post) {
            return _.get(post._getOrSetProp('myInfo'), 'member.read');
        };

        $scope.selectItem = function (task) {
            // 이동하다가 취소할 때 복원하기 위한 데이터
            var backupData = {
                activeId: $scope.commonList.activeId,
                isReadPost: getReadProperty(task)
            };
            setReadProperty(task, true);
            $scope.commonList.markSelectedItem(task.id);
            $timeout(function() {
                if (task.projectCode === $state.params.projectCode &&
                    task.number === $state.params.postNumber) {
                    return;
                }
                setReadProperty(task, backupData.isReadPost);
                if (backupData.activeId) {
                    $scope.commonList.markSelectedItem(backupData.activeId);
                } else {
                    $scope.defaultContentsCtrl.resetCheckedList();
                }
            }, 200, false);
        };

        var fetchLoading = function () {
            $scope.loading = _.some(loading);
        };

        // main list가 변경되면 그 값을 보여줍니다.
        var commonItemLoadingWatchHandler = $scope.$watch(CommonItemList.getLoading, function (val) {
            loading.list = val;
            fetchLoading();
            if (val) {
                ListCheckBoxBiz.init();
            } else {
                $scope.items = CommonItemList.getItems();
                DigestService.safeLocalDigest($scope);

                if ($state.includes('**.view')) {
                    $scope.commonList.markSelectedItem();
                }
            }
        });

        var noticeLoadingWatchHandler = $scope.$watch(NoticeTaskList.getLoading, function (val) {
            loading.notice = val;
            fetchLoading();
            if (!val) {
                $scope.noticeTasks = NoticeTaskList.getItems();
            }
        });

        $scope.isSelectedTask = function (post) {
            var stateParams = $state.params;
            return _.get(post, 'projectCode') === stateParams.projectCode &&
                post.number === stateParams.postNumber;
        };

        $scope.openTaskViewPopup = function (post, $event) {
            PopupUtil.openTaskViewPopup({
                projectCode: post.projectCode,
                postNumber: post.number
            });
            $event.preventDefault();
            $event.stopPropagation();
        };

        $scope.stateGoWithoutReload = function (stateName, stateParams) {
            CommonItemList.stateGoWithoutReload(stateName, stateParams);
        };

        $scope.toggleTagFilter = function (tagId) {
            var tags = $state.params.tags ? _.split($state.params.tags, ',') : ['and'],
                tagIdIdx = tags.indexOf(tagId);
            if (tagIdIdx > -1) {
                tags.splice(tagIdIdx, 1);
            } else {
                tags.push(tagId);
            }
            tags = tags.length === 1 ? [] : tags.join(',');
            $scope.stateGoWithoutReload('.', {tags: tags, page: 1});
        };

        $scope.toggleMilestoneFilter = function (milestoneId) {
            $scope.stateGoWithoutReload('.', {milestone: milestoneId === $state.params.milestone ? null : milestoneId});
        };

        $scope.toggleFilterMenus = function () {
            $scope.showFilterMenus = !TaskListFilterService.getShowFilterMenus();
            TaskListFilterService.setShowFilterMenus($scope.showFilterMenus);
            loading.filter = true;
            $scope.loading = true;
            $timeout(function () {
                loading.filter = false;
                $scope.loading = false;
            });
        };

        $scope.calcAllToMembers = function (post) {
            return _(post.users.to)
                .map(function (memberOrGroup) {
                    return memberOrGroup.type !== 'group' ?
                        memberOrGroup : memberOrGroup.group.members;
                })
                .flatten()
                .uniqBy('member.id').value().length;
        };

        $scope.isAscOrder = function (value) {
            return !_.startsWith(value, '-');
        };

        var stateParamsWatchHandler = angular.noop;
        if ($state.current.data.isContentList) {
            stateParamsWatchHandler = $scope.$watch(function () {
                return $state.params;
            }, function (newVal) {
                $scope.stateParams = newVal;
            });
        }

        $scope.$on('$destroy', function () {
            commonItemLoadingWatchHandler();
            noticeLoadingWatchHandler();
            stateParamsWatchHandler();
            CommonItemList.cancelFetchList();
        });

        $scope.$on('$locationChangeSuccess', function () {
            if (!StateParamsUtil.getListStatus()) {
                init(true);
            }
        });

        $scope.$on('$stateChangeStart', function () {
            StateParamsUtil.setListStatus('changing');
        });

        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if (!$state.includes('**.view') ||
                (StateParamsUtil.getProjectCodeFilter(fromParams) && $state.includes(PROJECT_STATE_NAMES.PROJECT_BOX) &&
                StateParamsUtil.getProjectCodeFilter(toParams) !== StateParamsUtil.getProjectCodeFilter(fromParams))
            ) {
                NoticeSummaryService.resetMessage();
                init();
            }
        });

        if ($state.includes('**.view')) {
            init();
        }
    }

})();
