(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .controller('TaskViewCtrl', TaskViewCtrl)
        .controller('TaskViewBodyCtrl', TaskViewBodyCtrl);


    /* @ngInject */
    function TaskViewCtrl($controller, $element, $scope, $state,
                          ITEM_TYPE, POPUP_STATE_NAMES, PROJECT_API_PARAM_NAMES, PROJECT_STATE_NAMES,
                          HelperConfigUtil, HelperUrlUtil, ItemSyncService, MeetingTaskViewModalFactory, MovePostsModal, MovingPost, NoticeTaskList, PermissionFactory, PopupUtil, PostErrorHandleUtil, PresentationSettingModalFactory, ProjectNoticeBiz, ResizeDividingElementFactory, SearchModalFactory, SharedLinkSettingModalFactory, PostTranslationStorageAction, TaskQuickSearchStorage, TaskViewBiz, TranslateBodyAction, TaskWorkflowService,
                          _) {
        $controller('CommonViewCtrl', {$scope: $scope, $element: $element});

        var pending = false;

        $scope._ = _;
        $scope.ResizeDividingElementFactory = ResizeDividingElementFactory;

        function init() {
            $scope.myMemberId = HelperConfigUtil.orgMemberId();
            $scope.ui = {
                visible: {
                    subPosts: true,
                    attachFiles: true,
                    comments: true,
                    remove: false,
                    noticeBtn: false,
                    sharedLink: false,
                    archived: false,
                    newSubPost: true
                }
            };

            $scope.uniqViewName = $scope.selectedTask.name;
        }

        init();

        $scope.getViewStateName = function () {
            var stateName = $state.current.name;
            if (_.startsWith(stateName, POPUP_STATE_NAMES.TASK_VIEW)) {
                return POPUP_STATE_NAMES.TASK_VIEW;
            }

            if (!_.startsWith(stateName, PROJECT_STATE_NAMES.PROJECT_STATE)) {
                return PROJECT_STATE_NAMES.PROJECT_BOX_VIEW;
            }

            return _.endsWith(stateName, 'view') ? stateName : stateName + '.view';
        };

        $scope.changeWorkflow = function (workflowId, target) {
            var post = $scope.selectedTask.data,
                params = {
                    projectCode: post.projectCode,
                    postNumber: post.number,
                    target: target
                };
            if (pending) {
                return;
            }

            pending = true;
            return TaskViewBiz.changeWorkflow(params, workflowId).then(function () {
                if (!$scope.selectedTask.status.loading) { //중복호출 방지
                    ItemSyncService.syncItemUsingRefresh(post, ITEM_TYPE.POST);
                }
            }, function (errorResponse) {
                var isContinue = PostErrorHandleUtil.onPostError(errorResponse, PostErrorHandleUtil.makeErrorMessageActions($scope.selectedTask, true));
                if (isContinue) {
                    $scope.selectedTask.refreshItem();
                } else {
                    ItemSyncService.syncItemUsingViewItem($scope.selectedTask.data, ITEM_TYPE.POST);
                }
            }).finally(function () {
                pending = false;
            });
        };

        $scope.openTaskViewPopup = function (post) {
            PopupUtil.openTaskViewPopup({
                projectCode: post.projectCode,
                postNumber: post.number
            });
        };

        $scope.openMeetingView = function (post) {
            MeetingTaskViewModalFactory.open(post);
        };

        $scope.openPresentationView = function (post) {
            PresentationSettingModalFactory.open(post);
        };

        $scope.openSharedLinkSettingModal = function (post) {
            SharedLinkSettingModalFactory.open(post.projectCode, post.number, post.createdAt, _.get(post, 'users.from.member.id'));
        };

        $scope.updateWriteForm = function (selectedTask) {
            openNewWriteFormBySelectedTask('update', selectedTask);
        };

        $scope.hasSharedLink = function (selectedTask) {
            return !_.isEmpty(selectedTask.data.validSharedLinkIdList);
        };

        function openNewWriteFormBySelectedTask(type, selectedTask) {
            PopupUtil.openTaskWritePopup(type, {
                projectCode: selectedTask.data.projectCode,
                postNumber: selectedTask.data.number
            });
        }

        $scope.noticeProject = function (selectedTask) {
            var task = selectedTask.data,
                target = task.pinned ? ProjectNoticeBiz.remove : ProjectNoticeBiz.notice;
            return target(_.get(task, 'projectCode'), task.number).then(function () {
                selectedTask.refreshItem();
                NoticeTaskList.fetchList();
            }, function (errorResponse) {
                var isContinue = PostErrorHandleUtil.onPostError(errorResponse, PostErrorHandleUtil.makeErrorMessageActions(selectedTask, true));
                if (!isContinue) {
                    ItemSyncService.syncItemUsingViewItem(selectedTask.data, ITEM_TYPE.POST);
                    $scope.ui.visible.noticeBtn = false;
                    PermissionFactory.canSetNotice(selectedTask.data).then(function () {
                        $scope.ui.visible.noticeBtn = true;
                    });
                }
            });
        };

        $scope.subPost = {
            register: function (selectedTask) {
                openNewWriteFormBySelectedTask('newsub', selectedTask);
            },
            append: function (selectedTask) {
                SearchModalFactory.open('append', selectedTask);
            },
            changeToSubPost: function (selectedTask) {
                SearchModalFactory.open('changeToSubPost', selectedTask);
            },
            changeToPost: function (selectedTask) {
                MovingPost.changeToPost(selectedTask.data).$promise.then(function () {
                    ItemSyncService.syncItemUsingRefresh(selectedTask.data, ITEM_TYPE.POST);
                });
            },
            changeProject: function (selectedTask) {
                MovePostsModal.open([selectedTask.data]);
            }
        };

        var saveLocalStorage = _.debounce(function (post) {
            TaskQuickSearchStorage.setRecentTasks(post);
            TaskQuickSearchStorage.setMentionMember(post.users.cc);
            TaskQuickSearchStorage.setMentionMember(post.users.to);
            TaskQuickSearchStorage.setMentionMember(post.users.from);
        }, 100);

        var selectedTaskWatchHandler = $scope.$watch('selectedTask.data.id', function (newVal) {
            if (_.isEmpty(newVal)) {
                return;
            }
            init();
            var post = $scope.selectedTask.data;
            $scope.ui.visible.archived = _.get(post._wrap.refMap.projectMap(post.projectId), 'state') === PROJECT_API_PARAM_NAMES.STATE.ARCHIVED;
            saveLocalStorage(post);

            $scope.clipText = HelperUrlUtil.makeProjectBoxUrl({
                projectCode: post.projectCode,
                postNumber: post.number
            }, {absolute: true, inherit: false});

            PermissionFactory.canRemoveTask(post).then(function () {
                $scope.ui.visible.remove = true;
            });
            PermissionFactory.canSetNotice(post).then(function () {
                $scope.ui.visible.noticeBtn = true;
            });
            PermissionFactory.canCreateSharedLink(post.projectCode, _.get(post.users.from, 'member.id')).then(function () {
                $scope.ui.visible.sharedLink = true;
            });
            PermissionFactory.canWriteNewSubPost(post).catch(function () {
                $scope.ui.visible.newSubPost = false;
            });

            $scope.translationInfo = PostTranslationStorageAction.loadTranslationInfo($scope.selectedTask.data.id);
            if ($scope.selectedTask.option.showRawContent !== newVal) {
                // 업무가 변경될 때마다 language가 변경될 수 있어서 갱신
                _setTranslation($scope.translationInfo);
            }
        });

        $scope.openTranslator = function (){
            var ref = PopupUtil.openTranslatorPopup();
            ref.content = $element.find('.dooray-contents')[0].innerText;
        };

        var workflowWatchHandler = $scope.$watch('selectedTask.data.users.me.member.workflowId', function (newVal) {
            if (!newVal) {
                $scope.myNextWorkflow = null;
                $scope.myNextWorkflowActionLabel = null;
                return;
            }
            $scope.myNextWorkflow = TaskWorkflowService.getMyNextWorkflow($scope.selectedTask.data);
            $scope.myNextWorkflowActionLabel = TaskWorkflowService.convertWorkflowToActionLabel(_.get($scope.myNextWorkflow, 'class'));
        });

        $scope.$on('$destroy', function () {
            selectedTaskWatchHandler();
            workflowWatchHandler();
        });

        $scope.translateContent = function(sourceLang, targetLang) {
            $scope.selectedTask.option.showRawContent = false;
            _setTranslation({
                sourceLang: sourceLang,
                targetLang: targetLang
            });
            $scope.translationInfo = _.cloneDeep($scope.translation);
            PostTranslationStorageAction.saveTranslationInfo($scope.selectedTask.data.id, $scope.translation);
        };

        $scope.showTranslation = function () {
            $scope.selectedTask.option.showRawContent = false;
            var translation = TranslateBodyAction.getDefaultTranslation();
            $scope.translateContent(translation.sourceLang, translation.targetLang);
        };

        $scope.showRawContent = function () {
            $scope.selectedTask.option.showRawContent = $scope.selectedTask.data.id;
            // 변경감지가 안되는 현상에 대한 방어코드
            _setTranslation(null);
            $scope.selectedTask.data.body = {};
            $scope.selectedTask.data.id = '';
            $scope.selectedTask.refreshItem();
        };

        $scope.hideTranslation = function () {
            $scope.translationInfo = null;
            PostTranslationStorageAction.removeTranslationInfo($scope.selectedTask.data.id);
            $scope.showRawContent();
        };

        function _setTranslation(translation) {
            if (!_.isEqual($scope.translation, translation)) {
                $scope.translation = _.cloneDeep(translation);
            }
        }

    }

    /* @ngInject */
    function TaskViewBodyCtrl($q, $scope, $state, $window, EMIT_EVENTS, ITEM_TYPE,
                              ItemSyncService, MessageModalFactory, MilestoneBiz, PostErrorHandleUtil, RootScopeEventBindHelper, TagBiz, TaskViewBiz, gettextCatalog, _) {
        var window$ = angular.element($window);

        $scope.hotfix = (function () {

            var self = {
                editTarget: null,
                show: function (target) {
                    return this.cancelWithConfirm().then(function () {
                        self.editTarget = target;
                        target.show();
                    });
                },
                cancel: function () {
                    _.result(this.editTarget, 'cancel');
                    delete this.editTarget;
                    return $q.when();
                },
                cancelWithConfirm: function () {
                    if (!this.editTarget || !this.editTarget.hasChanged()) {
                        return this.cancel();
                    }

                    var message = [
                        '<p>', gettextCatalog.getString('편집 중인 내용({{::editType}})이 있습니다.', {editType: self.editTarget.label}), '</p>' +
                        '<p>', gettextCatalog.getString('댓글을 입력하거나 화면이 닫히면 편집 중인 내용이 사라집니다.'), '</p>'
                    ].join('');
                    return MessageModalFactory.confirm(message, '', {
                        focusToCancel: true,
                        confirmBtnLabel: gettextCatalog.getString('계속하기'),
                        cancelBtnLabel: gettextCatalog.getString('편집 중인 내용 보기')
                    })
                        .result.then(_.bind(self.cancel, self), _.bind(self.focus, self));
                },
                focus: function () {
                    window$.focus();
                    _.result(this.editTarget, 'focus');
                    return $q.reject();
                },
                updateItem: function (data, option) {
                    var projectCode = _.get($scope.selectedTask, 'data.projectCode'),
                        postNumber = _.get($scope.selectedTask, 'data.number');
                    return TaskViewBiz.update(projectCode, postNumber, data).then(function () {
                        if (_.get(option, 'stopSync')) {
                            return;
                        }
                        if (_.get(option, 'getTwice')) {
                            // TODO 없음으로 변경 시에 바로 업무가 완료되지 않아 GET API 2번 호출
                            ItemSyncService.syncItemUsingRefresh($scope.selectedTask.data, ITEM_TYPE.POST).then(function () {
                                ItemSyncService.syncItemUsingRefresh($scope.selectedTask.data, ITEM_TYPE.POST);
                            });
                        } else {
                            ItemSyncService.syncItemUsingRefresh($scope.selectedTask.data, ITEM_TYPE.POST);
                        }
                    }, function (errorResponse) {
                        return PostErrorHandleUtil.onPostError(errorResponse, PostErrorHandleUtil.makeDefaultErrorActions($scope.selectedTask, function () {
                            return self.updateItem(data, option);
                        }));
                    });
                },
                submit: function () {
                    var data;

                    if (_.isFunction(this.editTarget.createSubmitData)) {
                        data = this.editTarget.createSubmitData();
                    }

                    if (_.isFunction(this.editTarget.submit)) {
                        Array.prototype.unshift.call(arguments, data);
                        this.editTarget.submit.apply(this.editTarget, arguments);
                        return;
                    }

                    if (!data) {
                        return;
                    }
                    this.updateItem(data, {getTwice: this.editTarget.getTwice});
                    this.cancel();
                },
                refreshWithSync: _refreshItemWithSync
            };
            return self;
        })();

        function _refreshItemWithSync() {
            $scope.selectedTask.refreshItem().then(function (post) {
                ItemSyncService.syncItemUsingViewItem(post, ITEM_TYPE.POST);
            });
        }

        function getInlineEditingConfirm(event) {
            if (_.result($scope.hotfix.editTarget, 'hasChanged')) {
                var message = '변경사항이 있습니다. 나가시겠습니까?';
                event.returnValue = message;
                return message;
            }
        }

        $scope.onFocusEditor = function () {
            return $scope.hotfix.cancelWithConfirm();
        };

        window$.on('beforeunload', getInlineEditingConfirm);

        $scope.$on('$stateChangeStart', function (event, toState, toParams) {
            if ($scope.hotfix.editTarget) {
                event.preventDefault();
                $scope.hotfix.cancelWithConfirm().then(function () {
                    $state.go(toState, toParams);
                });
            }
        });

        $scope.$on(EMIT_EVENTS.COLLECT_INLINE_EDITING_PROMISE, function (event, closeModalPromises) {
            if ($scope.hotfix.editTarget) {
                closeModalPromises.push($scope.hotfix.cancelWithConfirm());
            }
        });

        RootScopeEventBindHelper.withScope($scope)
            .on(TagBiz.EVENTS.RESETCACHE, function (event, reason, id) {
                if (_.includes([TagBiz.EVENT_REASON.UPDATE, TagBiz.EVENT_REASON.REMOVE], reason) &&
                    _.includes(_.get($scope.selectedTask.data, 'tagIdList', []), id)) {
                    _refreshItemWithSync();
                }
            })
            .on(MilestoneBiz.EVENTS.RESETCACHE, function (event, reason, id) {
                if (_.includes([MilestoneBiz.EVENT_REASON.UPDATE, MilestoneBiz.EVENT_REASON.REMOVE], reason) &&
                    _.includes(_.get($scope.selectedTask.data, 'milestoneId', null), id)) {
                    _refreshItemWithSync();
                }
            });

        var selectedTaskWatchHandler = $scope.$watch('selectedTask.data.id', function () {
            $scope.hotfix.cancel();
        });

        $scope.$on('$destroy', function () {
            window$.off('beforeunload', getInlineEditingConfirm);
            selectedTaskWatchHandler();
        });

    }
})();
