(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TaskDetail', TaskDetailFactory);

    /* @ngInject */
    function TaskDetailFactory($q, API_ERROR_CODE, API_PAGE_SIZE,
                               HelperPromiseUtil, LoadEventService, MessageModalFactory, PostErrorHandleUtil, StateParamsUtil, SubPostResource, TaskDisplayHelperFactory, TaskDraftResource, TaskFileResource, TaskResource, TaskViewBiz, gettextCatalog, _) {
        return TaskDetail;

        function TaskDetail() {
            this.name = '';
            this.param = {'projectCode': null, 'postNumber': null};
            this.draftParam = {'draftId': null};
            this.hasBeforeHistory = false;
            this.hasAfterHistory = false;
            this.files = [];
            this.data = {};
            this.errorInfo = null;
            var self = this;

            this.status = {
                loading: false,
                isNotSelected: true,
                subPostLoading: false,
                fileLoading: false,
                changedWorkflow: false,
                isDraft: false
            };

            this.option = {
                showCommentWithWorkLog: false,
                commentId: null,
                onlyPost: false,
                focusEventId: null,
                showRawContent: false,
                translationInfo: null
            };

            this.isDraft = function () {
                return this.status.isDraft;
            };

            var prevRefreshTaskResource = null;

            this.applyTaskWrapper = function (task) {
                return TaskDisplayHelperFactory.assignDisplayPropertiesInView(task);
            };

            this.getPromisesAfterRefreshTask = function () {
                if (this.option.commentId) {
                    return $q.when();
                }
                return this.option.onlyPost ? this.refreshSubPost() :
                    $q.all([this.refreshSubPost(), this.refreshComments()]);
            };

            this.onErrorActions = {};
            this.onErrorActions[API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED] = function (projectCode, postNumber, promiseCallback) {
                self.data.projectCode = projectCode;
                self.data.number = postNumber;
                self.param.projectCode = projectCode;
                self.param.postNumber = postNumber;
                var promise = promiseCallback ? promiseCallback(projectCode, postNumber) : self.refreshItem();
                return promise.then(function(result) {
                    if (_.startsWith(self.name, 'selected')) {
                        StateParamsUtil.changeParamWithoutReload({projectCode: projectCode, postNumber: postNumber});
                    }
                    return result;
                });
            };
            this.onErrorActions[API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED] = function (data) {
                data.projectCode = self.param.projectCode;
                data.number =  self.param.postNumber;
                self.reset();
                self.errorInfo = data;
                return $q.reject(data);
            };
            this.onErrorActions[API_ERROR_CODE.USER_INVALID_TASK_OVERWRITE] = function() {
                var errorMsg = ['<p>', gettextCatalog.getString('최신 버전이 아니기 때문에 저장할 수 없습니다.'), '</p>'].join('');
                MessageModalFactory.alert(errorMsg);
                return self.refreshItem();
            };

            this.refreshItem = function () {
                _cancelResource(prevRefreshTaskResource);
                var self = this;
                this.status.loading = true;
                this.status.isDraft = false;
                this.files = [];

                var param = _.cloneDeep(this.param);
                param.fields = !this.option.commentId && ['body'];
                prevRefreshTaskResource = TaskResource.get(param);
                var afterPromise = this.getPromisesAfterRefreshTask.call(self);

                return prevRefreshTaskResource.$promise.then(function (result) {
                    self.applyTaskWrapper(result.contents());
                    var task = result.contents();
                    self.files = _setFilesFromIdFileIdList(task);
                    self.data = task;
                    return task;
                }).then(function (task) {
                    return afterPromise.then(function () {
                        if (self.option.commentId || self.option.onlyPost) {
                            self.option.commentId = null;
                            self.option.onlyPost = false;
                        }
                        return task;
                    });
                }, function (errorResponse) {
                    if (HelperPromiseUtil.isResourcePending(prevRefreshTaskResource)) {
                        return $q.reject(errorResponse);
                    }

                    //self.data = {};
                    return PostErrorHandleUtil.onPostError(errorResponse, self.onErrorActions, {showMessage: true});
                }).finally(function () {
                    if (!HelperPromiseUtil.isResourcePending(prevRefreshTaskResource)) {
                        self.status.loading = false;
                    }

                });
            };

            var prevRefreshDraftResource = null;

            this.applyDraftWrapper = function (draft) {
                return new TaskDisplayHelperFactory.AssignDisplayPropertiesBuilder(draft)
                    .withMemberGroupFilter()
                    .withApplyColorToTags()
                    .withProjectCode()
                    .build();
            };

            this.refreshDraft = function () {
                _cancelResource(prevRefreshDraftResource);
                var self = this;

                this.data = {};
                this.subPosts = [];
                this.files = [];
                this.comments = [];
                this.commentsTotalCnt = 0;

                this.status.loading = true;
                this.status.isDraft = true;

                prevRefreshDraftResource = TaskDraftResource.get(this.draftParam);

                return prevRefreshDraftResource.$promise.then(function (result) {
                    var draft = result.contents();
                    self.applyDraftWrapper(draft);
                    self.data = draft;
                    self.files = _setFilesFromIdFileIdList(draft);
                    return draft;
                }, function (errorResponse) {
                    self.data = {};

                    return errorResponse;
                }).finally(function () {
                    self.status.loading = false;
                });
            };

            var prevRefreshSubPostResource = null;

            this.applySubPostWrapper = function (subPost) {
                return new TaskDisplayHelperFactory.AssignDisplayPropertiesBuilder(subPost)
                    .withMemberGroupFilter()
                    .withProjectCode()
                    .build();
            };

            this.refreshSubPost = function () {
                if (!this.param.projectCode || !this.param.postNumber) {
                    return;
                }
                _cancelResource(prevRefreshSubPostResource);

                var self = this;
                this.status.subPostLoading = true;

                prevRefreshSubPostResource = SubPostResource.get(this.param);

                return prevRefreshSubPostResource.$promise.then(function (result) {
                    self.subPosts = result.contents();
                    _.forEach(self.subPosts, function (subPost) {
                        self.applySubPostWrapper(subPost);
                    });
                }, function (errorResponse) {
                    self.subPosts = [];
                    return $q.reject(errorResponse);
                }).finally(function () {
                    self.status.subPostLoading = false;
                });
            };

            var prevRefreshFilesResource = null;

            this.refreshFiles = function () {
                _cancelResource(prevRefreshFilesResource);

                var self = this;
                this.status.fileLoading = true;

                prevRefreshFilesResource = TaskFileResource.query(this.param);

                return prevRefreshFilesResource.$promise.then(function (files) {
                    self.files = files.contents();
                    return files.contents();
                }, function (errorResponse) {
                    self.files = [];
                    return $q.reject(errorResponse);
                }).finally(function () {
                    self.status.fileLoading = false;
                });
            };

            this.applyCommentWrapper = function (comment) {
                return new TaskDisplayHelperFactory.AssignDisplayPropertiesBuilder(comment).build();
            };

            this.afterLoadComments = function (data) {
                _.assign(self, data);
            };

            this.setOption = function (option) {
                _.assign(this.option, option);
            };

            this.refreshComment = function () {
                if (!this.option.commentId) {
                    return;
                }

                LoadEventService.setApplyCommentWrapper(this.applyCommentWrapper);
                return LoadEventService.fetchComment(this.param, this.option.commentId)
                    .then(this.afterLoadComments, this.afterLoadComments);
            };

            this.refreshComments = function () {
                if (!this.param.projectCode || !this.param.postNumber) {
                    return;
                }

                LoadEventService.setApplyCommentWrapper(this.applyCommentWrapper);
                return LoadEventService.fetchComments(this.param, _getRefreshCommentOption(this.comments, this.option.showCommentWithWorkLog, this.option.focusEventId))
                    .then(this.afterLoadComments, this.afterLoadComments);
            };

            this.loadBeforeComments = function (size) {
                var option = this.option.showCommentWithWorkLog ? {} : {eventType: 'comment'};
                LoadEventService.setApplyCommentWrapper(this.applyCommentWrapper);
                return LoadEventService.loadBeforeComments(this.param, this.comments || [], size, option)
                    .then(this.afterLoadComments);
            };
            this.loadAfterComments = function (size) {
                var option = this.option.showCommentWithWorkLog ? {} : {eventType: 'comment'};
                LoadEventService.setApplyCommentWrapper(this.applyCommentWrapper);
                return LoadEventService.loadAfterComments(this.param, this.comments || [], size, option)
                    .then(this.afterLoadComments);
            };

            this.loadBetweenComments = function (commentHasBtn) {
                var option = this.option.showCommentWithWorkLog ? {} : {eventType: 'comment'};
                LoadEventService.setApplyCommentWrapper(this.applyCommentWrapper);
                return LoadEventService.loadBetweenComments(this.param, this.comments || [], commentHasBtn, option)
                    .then(this.afterLoadComments);
            };

            this.setParam = function (code, number, option) {
                option = option || {};
                this.param = {'projectCode': code, 'postNumber': number};
                this.errorInfo = null;

                this.data = {};
                this.option = {
                    showCommentWithWorkLog: option.showCommentWithWorkLog,
                    commentId: option.commentId,
                    onlyPost: option.onlyPost,
                    focusEventId: option.focusEventId
                };
                this.subPosts = [];
                this.files = [];
                this.comments = [];
                this.commentsTotalCnt = 0;

                return this.refreshItem();
            };

            this.setDraftParam = function (draftId) {
                this.draftParam.draftId = draftId;
                return this.refreshDraft();
            };

            this.onCheckGfmCheckBox = function (content) {
                var task = _.get(self, 'data', {}),
                    body = task.body;

                if(!body) {
                    return;
                }
                body.content = content;

                return TaskViewBiz.update(_.get(task, 'projectCode'), task.number, {body: body, version: task.version}).then(function () {
                   return self.refreshItem();
                }, function (errorResponse) {
                    return PostErrorHandleUtil.onPostError(errorResponse, self.onErrorActions);
                });
            };

            this.reset = function () {
                this.data = {};
                this.option = {};
                this.param = {'projectCode': null, 'postNumber': null};
                this.subPosts = [];
                this.files = [];
                this.comments = [];
                this.errorInfo = null;
                this.status.loading = false;
            };
        }

        function _getRefreshCommentOption(comments, showCommentWithWorkLog, focusEventId) {
            var option = showCommentWithWorkLog ? {} : {eventType: 'comment'};
            comments = comments || [];

            if (focusEventId) {
                option.baseEventId = focusEventId;
                return option;
            }

            if (comments.length > API_PAGE_SIZE.COMMENT) {
                _.assign(option, {
                    size: comments.length + 2,
                    baseEventId: _.findLast(comments, function (comment) {
                        return !comment._isDraft;
                    }).id
                });
                return option;
            }

            return option;
        }

        function _setFilesFromIdFileIdList(item) {
            return _.map(item.fileIdList, function(fileId){
                return item._wrap.refMap.fileMap(fileId);
            });
        }

        function _cancelResource(resource) {
            HelperPromiseUtil.cancelResource(resource);
        }
    }
})();
