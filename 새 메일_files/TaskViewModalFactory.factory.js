(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TaskViewModalFactory', TaskViewModalFactory)
        .factory('PostViewModalService', PostViewModalService)
        .controller('TaskViewModalCtrl', TaskViewModalCtrl)
        .controller('PostViewModalInFullViewCtrl', PostViewModalInFullViewCtrl);

    /* @ngInject */
    function TaskViewModalFactory($uibModal) {
        var openedModalInstance,
            openedFullViewModalInstance;
        return {
            openModal: openModal,
            isOpen: function (){
                return !!openedModalInstance;
            },
            openFullViewModal: openFullViewModal
        };

        // option: { windowClass: 'stream-view-modal' }
        function openModal(projectCode, postNumber, option) {
            if (openedModalInstance) {
                openedModalInstance.dismiss();
            }
            option = option || {windowClass: ''};
            option.windowClass += ' modal-itemview';

            openedModalInstance = $uibModal.open({
                templateUrl: 'modules/project/view/component/TaskViewModalFactory/taskViewModal.html',
                windowClass: option.windowClass,
                controller: 'TaskViewModalCtrl',
                resolve: {
                    projectCode: function () {
                        return projectCode;
                    },
                    postNumber: function () {
                        return postNumber;
                    }
                }
            });

            openedModalInstance.closed.then(function () {
                openedModalInstance = null;
            });
        }

        function openFullViewModal() {
            if (openedFullViewModalInstance) {
                return;
            }

            openedFullViewModalInstance = $uibModal.open({
                templateUrl: 'modules/project/view/component/TaskViewModalFactory/fullPostViewModal.html',
                windowClass: 'full-view-modal modal-itemview',
                backdropClass: 'none-backdrop',
                controller: 'PostViewModalInFullViewCtrl'
            });

            openedFullViewModalInstance.closed.then(function () {
                openedFullViewModalInstance = null;
            });
        }
    }

    /* @ngInject */
    function PostViewModalService($q, _) {
        return {
            onClosingModal: onClosingModal
        };

        function onClosingModal($event, resultOrReason, isClosed, broadcastCollection) {

            //모달창을 닫기전에 현재 에디팅되는 인라인 편집부분이 있는지 확인하는 용도입니다.
            if (isClosed || _.isUndefined(resultOrReason)) {
                return $q.reject();
            }
            //escape key press and dismissed
            var closeModalPromises = [];
            broadcastCollection(closeModalPromises);

            if (_.isEmpty(closeModalPromises)) {
                return $q.reject();
            }

            $event.preventDefault();

            return $q.all(closeModalPromises);
        }
    }

    /* @ngInject */
    function TaskViewModalCtrl($scope, $uibModalInstance, API_ERROR_CODE, EMIT_EVENTS, ITEM_TYPE, DetailInstanceFactory, ItemSyncService, PostViewModalService, RootScopeEventBindHelper, projectCode, postNumber) {
        $scope.shared = {
            isViewModal: true
        };

        $scope.selectedTask = DetailInstanceFactory.getOrMakeModalItem(ITEM_TYPE.POST);
        $scope.selectedTask.setParam(projectCode, postNumber).then(function (task) {
            ItemSyncService.syncItemUsingViewItem(task, ITEM_TYPE.POST);
            $scope.removedPostInfo = null;
        }, function (errorResult) {
            if (errorResult.status === 403) {
                $scope.closeTaskView();
            }

            if (errorResult.errorCode === API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED) {
                $scope.removedPostInfo = errorResult;
            }
        });

        $scope.closeTaskView = function () {
            $uibModalInstance.dismiss('click close button');
        };

        $scope.$on('$stateChangeSuccess', function () {
            $uibModalInstance.dismiss();
        });

        $scope.$on('modal.closing', function ($event, resultOrReason, isClosed) {
            PostViewModalService.onClosingModal($event, resultOrReason, isClosed, function (collection) {
                $scope.$emit(EMIT_EVENTS.COLLECT_INLINE_EDITING_PROMISE, collection);
            }).then(function () {
                $uibModalInstance.dismiss();
            });
        });
    }

    /* @ngInject */
    function PostViewModalInFullViewCtrl($document, $scope, $state, $timeout, $uibModalInstance, $uiViewScroll, API_ERROR_CODE, EMIT_EVENTS, ITEM_TYPE, PROJECT_STATE_NAMES, CommonItemList, DetailInstanceFactory, ItemSyncService, PostViewModalService, ResizeDividingElementFactory, RootScopeEventBindHelper, StateParamsUtil, ViewModeBiz) {
        $scope.shared = {
            isFullViewModal: true
        };

        $scope.selectedTask = DetailInstanceFactory.getOrMakeSelectedItem(ITEM_TYPE.POST);
        $scope.isDraftBox = $state.includes(PROJECT_STATE_NAMES.DRAFT_BOX);

        if ($scope.isDraftBox) {
            $scope.selectedTask.setDraftParam($state.params.draftId);
        } else {
            $scope.selectedTask.setParam($state.params.projectCode, $state.params.postNumber, {focusEventId: $state.params.focusEventId}).then(function (post) {
                if (post._getOrSetProp('movedPost')) {
                    StateParamsUtil.changeParamWithoutReload({projectCode: post.projectCode, postNumber: post.number});
                }
                ItemSyncService.syncItemUsingViewItem(post, ITEM_TYPE.POST);
                if ($state.params.focusEventId) {
                    StateParamsUtil.changeParamWithoutReload({focusEventId: null});
                    _scrollTo('#' + $scope.selectedTask.name + '-commentlist-anchor-' + $state.params.focusEventId);
                }
            }, function (errorResult) {
                if (errorResult.errorCode === API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED) {
                    $scope.removedPostInfo = errorResult;
                }
            });
        }

        function _scrollTo(jquerySelector) {
            $timeout(function () {
                $uiViewScroll(angular.element(jquerySelector));
            }, 500, false);
        }

        $scope.changeDetailViewMode = function () {
            ResizeDividingElementFactory.toggleScreenMode('fullViewModal');
        };

        $scope.closeTaskView = function () {
            $uibModalInstance.dismiss('click close button');
        };

        $scope.$on('$stateChangeStart', function (event, toState) {
            if (!_.endsWith(toState.name, 'view') || ViewModeBiz.get() === ViewModeBiz.VIEW_MODE.VERTICAL_SPLIT_VIEW) {
                $scope.closeTaskView();
            }
        });

        init();

        function init() {
            $document.on('mousedown', onMousedown);
            $scope.$on('$destroy', function () {
                $document.off('mousedown', onMousedown);
            });

            $scope.$on('modal.closing', function ($event, resultOrReason, isClosed) {
                PostViewModalService.onClosingModal($event, resultOrReason, isClosed, function (collection) {
                    $scope.$broadcast(EMIT_EVENTS.COLLECT_INLINE_EDITING_PROMISE, collection);
                }).then(function () {
                    $uibModalInstance.dismiss();
                });

                if (ViewModeBiz.get() === ViewModeBiz.VIEW_MODE.FULL_VIEW) {
                    // 업무 쓰기를 할 때 예외처리 https://nhnent.dooray.com/project/projects/dooray-프로젝트/3905
                    $timeout(function () {
                        CommonItemList.stateGoWithoutReload($state.current.name.replace('.view', ''), {}, {withoutFetchList: true});
                        $scope.selectedTask.reset();
                    }, 200, false);
                }
            });
        }

        function onMousedown(event) {
            var target$ = angular.element(event.target);
            var isClickOnList = !_.isEmpty(target$.parents('.ui-grid-row')),
                isClickOnModal = !_.isEmpty(target$.parents('.modal,.tui-text-palette,.profile-layer')) || target$.is('.modal'),
                isInView = !_.isEmpty(target$.parents('html'));

            if (!isClickOnModal && !isClickOnList && isInView) {
                $scope.closeTaskView();
            }
        }
    }

})();
