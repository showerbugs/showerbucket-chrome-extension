(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .controller('CommonViewCtrl', CommonViewCtrl);

    /* @ngInject */
    function CommonViewCtrl($scope, $state, $element, $timeout, $uiViewScroll, API_ERROR_CODE, ITEM_TYPE, MIME_TYPE, PROJECT_STATE_NAMES,
                            BrowserTitleChangeAction, CommonItemList, DateConvertUtil, DetailInstanceFactory, DigestService, ItemSyncService, MessageModalFactory, PostErrorHandleUtil, StateParamsUtil, StreamItemList, StreamModalFactory, PostTempSaveStorage, TaskResource, ViewModeBiz, gettextCatalog, _) {
        $scope.MIME_TYPE = MIME_TYPE;
        $scope.shared = $scope.shared || {};
        // taskContentsCtrl을 못부르는 popup에서는 CommonView가 selectedTask의 최상위
        $scope.selectedTask = $scope.selectedTask || DetailInstanceFactory.getOrMakeSelectedItem(ITEM_TYPE.POST);

        function removeTask(post, postId) {
            return TaskResource.remove({projectCode: post.projectCode, postNumber: post.number}).$promise.then(function () {
                if (postId === post.id && !StreamModalFactory.isOpen()) {
                    $state.go('^');
                }

                if (StreamModalFactory.isOpen()) {
                    $scope.closeTaskView();
                    StreamItemList.removeItem('post', postId);
                }
                PostTempSaveStorage.removeItemUpdate(postId);
                PostTempSaveStorage.removeCommentNew(postId);
            }, function (errorResponse) {
                var isContinue = PostErrorHandleUtil.onPostError(errorResponse, PostErrorHandleUtil.makeDefaultErrorActions(post, function () {
                    return removeTask(post, postId);
                }, true));
                return isContinue ? CommonItemList.onErrorWhileRemoving(['<p class="text-center">', gettextCatalog.getString('업무가 정상적으로 삭제되지 않았습니다.'), '</p>'].join(''), function () {
                    return removeTask(post, postId);
                }) : null;
            });
        }

        $scope.removeItem = function (selectedTask) {
            var postId = selectedTask.data.id;

            MessageModalFactory.confirm(
                ['<p class="text-center">', gettextCatalog.getString('업무를 삭제하면 다시 복구할 수 없습니다.'), '</p>' +
                '<p class="text-center">', gettextCatalog.getString('정말 삭제하시겠습니까?'), '</p>'].join(''),
                gettextCatalog.getString('업무 삭제'), {
                    confirmBtnLabel: gettextCatalog.getString('삭제')
                }).result.then(function () {
                    CommonItemList.removeItems([postId]);
                    removeTask(selectedTask.data, postId);
                });
        };

        //테스크의 전체나 부분적 비동기 로딩이 모두 완료 되었을때 기존 스크롤의 위치를 임시 저장 및 수동 복원
        $scope.checkLoadingComplete = function (target) {
            return !_.some([target.status.loading, target.status.subPostLoading, target.status.fileLoading]);
        };

        $scope.convertDateTimeInView = function (date) {
            return DateConvertUtil.convertDateTimeInView(date);
        };

        var changeSelectedTaskFromParams = function (params) {

            if (params.projectCode && params.postNumber) {
                changeSelectedTask({
                    projectCode: params.projectCode,
                    number: params.postNumber
                }, {
                    commentId: params.commentId,
                    onlyPost: params.onlyPost,
                    focusEventId: params.focusEventId
                });
                if (params.focusEventId) {
                    StateParamsUtil.changeParamWithoutReload({focusEventId: null});
                    _scrollTo('#' + $scope.selectedTask.name + '-commentlist-anchor-' + params.focusEventId);
                }
            } else if (params.draftId) {
                changeSelectedDraft(params.draftId);
            }
        };

        function _scrollTo(jquerySelector) {
            $timeout(function () {
                $uiViewScroll($element.find(jquerySelector));
            }, 0, false);
        }

        function changeSelectedTask(postInfo, option) {
            $scope.selectedTask.setParam(postInfo.projectCode, postInfo.number, option).then(function (post) {
                if (post._getOrSetProp('movedPost')) {
                    StateParamsUtil.changeParamWithoutReload({projectCode: post.projectCode, postNumber: post.number});
                }
                ItemSyncService.syncItemUsingViewItem(post, ITEM_TYPE.POST);

                if ($state.includes(PROJECT_STATE_NAMES.MENTION_BOX) && $state.params.onlyPost) {
                    _scrollTo('.mention-markdown.my');
                }
                $scope.removedPostInfo = null;
                DigestService.safeGlobalDigest();
            }, function (errorResult) {
                if (errorResult.errorCode === API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED) {
                    $scope.removedPostInfo = errorResult;
                }
            });
        }

        function changeSelectedDraft(draftId) {
            if (!draftId) {
                $scope.selectedTask.reset();
            } else {
                $scope.selectedTask.setDraftParam(draftId);
            }
        }

        var selectedTaskWatchHandler = $scope.$watch('selectedTask.data.id', function () {
            $scope.selectedTask.status.isNotSelected = _.isEmpty($scope.selectedTask.data);
            _changeBrowserTitle();
        });

        if (!$scope.closeTaskView || $scope.shared.isFullViewModal) {
            $scope.$on('$stateChangeSuccess', function (event, toState, toParams) {
                if ($scope.shared.isFullViewModal && ViewModeBiz.get() === ViewModeBiz.VIEW_MODE.VERTICAL_SPLIT_VIEW) {
                    return;
                }
                changeSelectedTaskFromParams(toParams);

                $scope.isSimpleViewMode = !_.isUndefined(toParams.commentId) || toParams.onlyPost;
                $scope.isOnlyPost = toParams.onlyPost;
                if (!_.isUndefined(toParams.commentId)) {
                    $scope.selectedTask.refreshComment();
                }
            });
        }

        function _changeBrowserTitle() {
            var post = $scope.selectedTask.data;
            if (post.id && _.startsWith($scope.selectedTask.name, 'selected')) {
                var postNumber = ['#', _.get(post, 'projectCode'), '/', post.number].join('');
                BrowserTitleChangeAction.changeBrowserTitle([postNumber, post.subject].join(' | '));
            }
        }

        $scope.$on('$destroy', function () {
            selectedTaskWatchHandler();
            $scope.selectedTask = null;
        });
    }

})();
