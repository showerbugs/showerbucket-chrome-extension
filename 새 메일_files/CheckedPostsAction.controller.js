(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .controller('CheckedPostsActionCtrl', CheckedPostsActionCtrl);

    /* @ngInject */
    function CheckedPostsActionCtrl($document, $element, $state, $scope, $timeout, ITEM_TYPE, PROJECT_STATE_NAMES, CommonItemList, DigestService, ListActionButtonBiz, ListCheckBoxBiz, MilestoneBiz, MovePostsModal, NoticeSummaryService, PermissionFactory, Project, RootScopeEventBindHelper, StateParamsUtil, TagBiz, _) {
        var self = this;

        self.model = {
            tickedTags: [],
            milestone: null
        };
        self.uiModel = {
            filterRule: {status: 'open'},
            activeMilestoneTabIndex: 0,
            isOpenTagPane: false,
            editBtnOpen: false,
            tagList: [],
            milestoneList: [],
            checkedItems: [],
            hasUnreadItem: false,
            editBtnDropdown$: null
        };

        self.action = {
            read: setReadPosts,
            unread: setUnreadPosts,
            complete: completePosts,
            removePosts: removePosts,
            assignMilestone: assignMilestoneToPosts,
            assignTag: assignTagToPosts,
            openMovePostsModal: openMovePostsModal
        };
        self.ui = {
            canShowReadBtn: canShowReadBtn,
            canShowUnreadBtn: canShowUnreadBtn,
            canShowRemoveBtn: canShowRemoveBtn,
            hasCheckedItem: hasCheckedItem,
            hasNotClosedItem: hasNotClosedItem
        };
        self.changeMilestonesFilterRule = changeMilestonesFilterRule;
        self.onOpenTagPane = onOpenTagPane;
        self.onCloseTagPane = onCloseTagPane;

        _init();
        $scope.$watchCollection(ListCheckBoxBiz.getCheckedItems, function (value) {
            self.uiModel.checkedItems = value;
        });

        $scope.$watch(ListCheckBoxBiz.hasUnreadItem, function (value) {
            self.uiModel.hasUnreadItem = value;
        });


        // ------- define action methods -------

        function setReadPosts() {
            ListActionButtonBiz.read(ITEM_TYPE.POST);
        }

        function setUnreadPosts() {
            ListActionButtonBiz.unread(ITEM_TYPE.POST);
        }

        function completePosts() {
            ListActionButtonBiz.completeList().then(function () {
                CommonItemList.fetchList();
                // 대시보드 숫자 갱신을 위해 호출
                Project.resetCache();
                NoticeSummaryService.showCompletePostsMsg();
            });
        }

        function removePosts() {
            ListActionButtonBiz.removeItemsWithConfirm(ITEM_TYPE.POST).then(function () {
                NoticeSummaryService.showRemovePostsMsg();
            });
        }

        function assignMilestoneToPosts(item) {
            $document.trigger('click');
            ListActionButtonBiz.assignMilestone(item).then(function () {
                NoticeSummaryService.showChangeMilestoneMsg();
            });
        }

        function assignTagToPosts(selectedTagItem) {
            var tagPrefix = selectedTagItem.tagPrefixId && selectedTagItem._wrap.refMap.tagPrefixMap(selectedTagItem.tagPrefixId);

            if (tagPrefix && !tagPrefix.selectOne) {
                var maxTagIdList = ListCheckBoxBiz.makeLodashCheckedItems()
                    .maxBy(function (post) {
                        return post.tagIdList.length;
                    }).tagIdList;

                if (!TagBiz.validate(maxTagIdList, selectedTagItem)) {
                    return;
                }
            }

            ListActionButtonBiz.assignTag(selectedTagItem, self.uiModel.tagList, _.get(tagPrefix, 'selectOne')).then(function () {
                NoticeSummaryService.showChangeTagMsg();
            });
        }

        function openMovePostsModal() {
            MovePostsModal.open(ListCheckBoxBiz.getCheckedItems()).then(function (projectCode) {
                var stateName = $state.current.name.replace(/\.view$/, '');
                $state.go(stateName, {projectCode: $state.params.projectCode}, {reload: stateName});
                NoticeSummaryService.showChangeProjectMsg(projectCode);
            });
        }

        // ------- define ui methods -------

        function canShowReadBtn() {
            return self.uiModel.read && self.uiModel.hasUnreadItem;
        }

        function canShowUnreadBtn() {
            return self.uiModel.read && !self.uiModel.hasUnreadItem;
        }

        function canShowRemoveBtn() {
            return $state.includes(PROJECT_STATE_NAMES.PROJECT_BOX) ?
                PermissionFactory.isProjectAdmin() : _.get($state.current, 'data.actionButtons.remove');
        }

        function hasCheckedItem() {
            return !_.isEmpty(self.uiModel.checkedItems);
        }

        function hasNotClosedItem() {
            return _.some(self.uiModel.checkedItems, function (item) {
                return _.get(item, 'users.me._workflowClass') !== 'closed';
            });
        }


        // ------- define etc methods -------

        function changeMilestonesFilterRule(status) {
            self.uiModel.filterRule = MilestoneBiz.getMilestoneTabFilterRule(status);
            self.uiModel.activeMilestoneTabIndex = status === 'open' ? 0 : 1;
        }

        function onOpenTagPane() {
            self.uiModel.isOpenTagPane = true;
        }

        function onCloseTagPane() {
            self.uiModel.isOpenTagPane = false;
        }

        // ------- define helper functions -------

        function _openTagAssignPane() {
            self.uiModel.isOpenTagPane = true;var tagIdMap = _makeTagIdsAtCheckedPosts();

            return TagBiz.getTagsForMultiSelect(StateParamsUtil.getProjectCodeFilter(), tagIdMap.tagIds, tagIdMap).then(function (tags) {
                self.uiModel.tagList = tags;
                self.model.tickedTags = [];
            });
        }

        function _makeTagIdsAtCheckedPosts() {
            var tagIds = [],
                checkedPostCount = 0,
                minusTickTagMap = {};
            checkedPostCount = ListCheckBoxBiz.makeLodashCheckedItems()
                .map(function (post) {
                    [].push.apply(tagIds, post.tagIdList);
                    return post;
                })
                .value().length;
            tagIds = _(tagIds).countBy()
                .map(function (value, key) {
                    minusTickTagMap[key] = value < checkedPostCount;
                    return key;
                })
                .value();

            return {
                tagIds: tagIds,
                minusTickTagMap: minusTickTagMap
            };
        }

        function _fetchMilestones() {
            MilestoneBiz.getMilestonesForDropdown(StateParamsUtil.getProjectCodeFilter()).then(function (result) {
                self.uiModel.milestoneList = result.contents();
            });
        }

        function _setEditDropdownEvent() {
            $timeout(function () {
                self.uiModel.editBtnDropdown$ = $element.find('.list-edit-dropdown');

                self.uiModel.editBtnDropdown$.on('show.bs.dropdown', function () {
                    self.uiModel.editBtnOpen = true;
                    if (self.uiModel.tags) {
                        _openTagAssignPane().finally(function () {
                            DigestService.safeLocalDigest($scope);
                        });
                    }
                });

                self.uiModel.editBtnDropdown$.on('hidden.bs.dropdown', function () {
                    self.uiModel.editBtnOpen = false;
                    DigestService.safeLocalDigest($scope);
                });

                $scope.$on('$destroy', function () {
                    self.uiModel.editBtnDropdown$.off('show.bs.dropdown');
                    self.uiModel.editBtnDropdown$.off('hidden.bs.dropdown');
                });
            }, 0, false);
        }

        function _init() {
            NoticeSummaryService.resetMessage();
            _.assign(self.uiModel, $state.current.data.actionButtons);
            if (!self.uiModel.milestone && self.uiModel.tags) {
                return;
            }
            _setEditDropdownEvent();

            if (self.uiModel.milestone) {
                _fetchMilestones();
                RootScopeEventBindHelper.withScope($scope).on(MilestoneBiz.EVENTS.RESETCACHE, _fetchMilestones);
            }
        }
    }

})();
