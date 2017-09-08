(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .service('CommentWriteformApiBuilder', CommentWriteformApiBuilder);

    /* @ngInject */
    function CommentWriteformApiBuilder($q, ITEM_TYPE, DateConvertUtil, DetailInstanceFactory, ItemSyncService, MyInfo, PostErrorHandleUtil, ResponseWrapAppendHelper, _) {
        var draftCommentId = 1;

        var paramMap = {
            post: {
                makeDefaultParam: function (item) {
                    return {
                        projectCode: _.get(item, 'projectCode'),
                        postNumber: _.get(item, 'number')
                    };
                },
                makeCreateForm: function (commentWriteform) {
                    return _.assign(
                        this.makeDefaultParam(commentWriteform.item),
                        {body: commentWriteform.targetComment.body}, {
                            fileIdList: _.cloneDeep(commentWriteform.fileWrapper.getTmpFileIds())
                        });
                },
                makeEditForm: function (commentWriteform) {
                    return _.assign(
                        this.makeDefaultParam(commentWriteform.item),
                        {body: commentWriteform.targetComment.body}, {
                            eventId: _.get(commentWriteform, 'targetComment.id')
                        });
                },
                makeDeleteForm: function (commentWriteform) {
                    return _.assign(
                        this.makeDefaultParam(commentWriteform.item), {
                            eventId: _.get(commentWriteform, 'targetComment.id')
                        });
                }
            },
            schedule: {
                makeDefaultParam: function (item) {
                    return {
                        scheduleId: item.id
                    };
                },
                makeCreateForm: function (commentWriteform) {
                    return _.assign(
                        this.makeDefaultParam(commentWriteform.item),
                        {body: commentWriteform.targetComment.body}, {
                            scheduleId: _.get(commentWriteform.item, 'id'),
                            fileIdList: _.cloneDeep(commentWriteform.fileWrapper.getTmpFileIds())
                        });
                },
                makeEditForm: function (commentWriteform) {
                    return _.assign(
                        this.makeDefaultParam(commentWriteform.item),
                        {body: commentWriteform.targetComment.body}, {
                            eventId: _.get(commentWriteform, 'targetComment.id')
                        });
                },
                makeDeleteForm: function (commentWriteform) {
                    return _.assign(
                        this.makeDefaultParam(commentWriteform.item), {
                            eventId: _.get(commentWriteform, 'targetComment.id')
                        });
                }
            }
        };


        var ApiBuilder = angular.element.inherit({
            __constructor: function (commentWriteform) {
                this.commentWriteform = commentWriteform;
                this.beforeCallbacks = [];
                this.afterCallbacks = [];
                this.errorCallbacks = [];
            },
            withApi: function (api) {
                this.api = api;
                return this;
            },
            withParam: function (param) {
                this.param = param;
            },
            withErrorCallback: function (callback) {
                this.errorCallbacks.push(callback);
                return this;
            },
            withBeforeCallback: function (callback) {
                this.beforeCallbacks.push(callback);
                return this;
            },
            withAfterCallback: function (callback) {
                this.afterCallbacks.push(callback);
                return this;
            },
            withPostErrorHandle: function (submitFunc) {
                this.withErrorCallback(function (errorResponse, commentWriteform) {
                    if (commentWriteform.type !== ITEM_TYPE.POST) {
                        return;
                    }
                    var dummyInstance = DetailInstanceFactory.createDummyItem(ITEM_TYPE.POST);
                    dummyInstance.param = {
                        projectCode: commentWriteform.item.projectCode,
                        postNumber: commentWriteform.item.number
                    };
                    commentWriteform.submitPromise = null;
                    var hasUnhandledError = PostErrorHandleUtil.onPostError(errorResponse, PostErrorHandleUtil.makeDefaultErrorActions(dummyInstance, function (projectCode, postNumber) {
                        commentWriteform.item.projectCode = projectCode;
                        commentWriteform.item.number = postNumber;
                        return submitFunc();
                    }));
                    if (!hasUnhandledError) {
                        ItemSyncService.syncViewUsingCallback(commentWriteform.item.id, commentWriteform.type, function (detailInstance) {
                            detailInstance.errorInfo = dummyInstance.errorInfo;
                        });
                    }
                    // false를 return하면 이후에 있는 error handle 로직이 실행되지 않습니다.
                    return hasUnhandledError;
                });
                return this;
            },
            withRemoveComment: function () {
                this.withBeforeCallback(function (commentWriteform) {
                    ItemSyncService.syncViewUsingCallback(commentWriteform.item.id, commentWriteform.type, function (detail) {
                        _.remove(detail.comments, {'id': commentWriteform.targetComment.id});
                    });
                });
                return this;
            },
            withDraftComment: function () {
                this.withBeforeCallback(function (commentWriteform) {
                    return makeDraftComment(commentWriteform).then(function (draftComment) {
                        if (commentWriteform._editCommentApi) {
                            // editMode
                            commentWriteform.targetComment.eventId = commentWriteform.targetComment.id;
                            _.assign(commentWriteform.targetComment, draftComment);
                            return;
                        }
                        draftCommentId += 1;
                        draftComment.id = 'draft' + draftCommentId;
                        commentWriteform.comments.push(draftComment);
                    });
                });
                return this;
            },
            withRefreshItem: function () {
                this.withAfterCallback(function (commentWriteform) {
                    return RefreshHelper.refreshItem(commentWriteform);
                });
                return this;
            },
            withSetEmptyEditor: function () {
                var text;
                this.withBeforeCallback(function (commentWriteform) {
                    text = commentWriteform.targetComment.body.content;
                });

                this.withErrorCallback(function (errorResponse, commentWriteform) {
                    commentWriteform.targetComment.body.content = text;
                });
                return this;
            },
            withResetFiles: function () {
                this.withBeforeCallback(function (commentWriteform) {
                    return commentWriteform.fileWrapper.resetFlowFiles();
                });
                return this;
            },
            withRefreshComments: function () {
                this.withAfterCallback(function (commentWriteform) {
                    return RefreshHelper.refreshComments(commentWriteform);
                });
                return this;
            },
            build: function () {
                var self = this,
                    commentWriteform = this.commentWriteform;
                return function () {
                    if (self.commentWriteform.isSubmitPending()) {
                        return $q.reject();
                    }
                    _.forEach(self.beforeCallbacks, function (callback) {
                        callback(commentWriteform, self);
                    });
                    self.commentWriteform.submitPromise = self.api(self.param).then(function () {
                        return $q.all(_.map(self.afterCallbacks, function (callback) {
                            return callback(commentWriteform, self);
                        }));
                    }, function (errorResponse) {
                        return $q.all(_.forEach(self.errorCallbacks, function (callback) {
                            return callback(errorResponse, commentWriteform, self);
                        })).finally(function () {
                            return $q.reject(errorResponse);
                        });
                    });
                    return self.commentWriteform.submitPromise;
                };
            }
        }, {
            paramFactory: {
                makeDefaultForm: function (item, type) {
                    return paramMap[type] && paramMap[type].makeDefaultParam(item);
                },
                makeCreateForm: function (commentWriteform) {
                    return paramMap[commentWriteform.type] &&
                        paramMap[commentWriteform.type].makeCreateForm(commentWriteform);
                },
                makeEditForm: function (commentWriteform) {
                    return paramMap[commentWriteform.type] &&
                        paramMap[commentWriteform.type].makeEditForm(commentWriteform);
                },
                makeDeleteForm: function (commentWriteform) {
                    return paramMap[commentWriteform.type] &&
                        paramMap[commentWriteform.type].makeDeleteForm(commentWriteform);
                }
            }
        });

        var RefreshHelper = {
            refreshItem: function (commentWriteform) {
                var itemId = commentWriteform.item.id,
                    type = commentWriteform.type,
                    param = ApiBuilder.paramFactory.makeDefaultForm(commentWriteform.item, type);
                return ItemSyncService.syncItemUsingRefresh(commentWriteform.item, type, true).then(function (result) {
                    if (_.isArray(result)) {
                        commentWriteform.comments = commentWriteform._destroyed ? null : result[1].comments;
                        return ItemSyncService.syncStreamComments(itemId, type, result[1].comments);
                    }
                    var selectedItem = DetailInstanceFactory.createDummyItem(commentWriteform.type);
                    selectedItem.param = param;
                    return selectedItem.refreshComments().then(function() {
                        return ItemSyncService.syncStreamComments(itemId, type, selectedItem.comments);
                    });
                });
            },
            refreshComments: function (commentWriteform) {
                var selectedItem = DetailInstanceFactory.createDummyItem(commentWriteform.type),
                    item = commentWriteform.item,
                    type = commentWriteform.type;
                var param = ApiBuilder.paramFactory.makeDefaultForm(commentWriteform.item, commentWriteform.type);
                selectedItem.param = _.isObject(param) ? _.assign(selectedItem.param, param) : param;

                if (!_.isFunction(selectedItem.refreshFiles) || !_.isFunction(selectedItem.refreshComments)) {
                    return;
                }
                return $q.all([selectedItem.refreshFiles(), selectedItem.refreshComments()]).then(function () {
                    var fileIdList = _.map(selectedItem.files, 'id');
                    commentWriteform.comments = commentWriteform._destroyed ? [] : selectedItem.comments;
                    ItemSyncService.syncStreamComments(item.id, type, commentWriteform.comments);
                    ItemSyncService.syncViewUsingCallback(item, type, function (detail) {
                        detail.files = selectedItem.files;
                        detail.comments = selectedItem.comments;
                        detail.commentTotalCnt = selectedItem.commentTotalCnt;
                        detail.hasBeforeHistory = selectedItem.hasBeforeHistory;
                        detail.hasAfterHistory = selectedItem.hasAfterHistory;
                    });
                    ItemSyncService.syncItemUsingCallback(item.id, type, function (item) {
                        item.fileIdList = fileIdList;
                    });
                });
            }
        };

        function makeDraftComment(commentWriteform) {
            var targetComment = commentWriteform.targetComment,
                draftCommentContent = _.assign({body: commentWriteform.targetComment.body}, {
                    createdAt: commentWriteform._editCommentApi ? targetComment.createdAt : DateConvertUtil.makeDefaultIso8601String(),
                    fileIdList: _.get(targetComment, 'fileIdList', []) || [], // null인 경우 예외처리
                    type: 'comment',
                    _isDraft: true // draft인지 확인하기위해 필요
                }), draftReferences = {
                    organizationMemberMap: {},
                    fileMap: _.get(targetComment, '_wrap.refMap.fileMap', {})
                }, tmpFileIds = _.get(commentWriteform.fileWrapper, 'tmpFileIds', []), draftComment;

            draftCommentContent.fileIdList = draftCommentContent.fileIdList.concat(tmpFileIds);

            // FileService가 tmpFileIds를 지우기 전에 처리하기 위에 여기서 처리
            _.forEach(tmpFileIds, function (fileId, index) {
                draftReferences.fileMap[fileId] = commentWriteform.fileWrapper.flowObject.files[index];
            });
            // 캐시로 인해 빠른 응답이 옵니다.
            return MyInfo.getMyInfo().then(function (myInfo) {
                draftCommentContent.creator = {
                    type: 'member',
                    member: {
                        organizationMemberId: myInfo.id
                    }
                };

                draftReferences.organizationMemberMap[myInfo.id] = myInfo;

                draftComment = ResponseWrapAppendHelper.create({
                    content: draftCommentContent,
                    references: draftReferences
                }).contents();
                commentWriteform.applyCommentWrapper(draftComment);

                return draftComment;
            });
        }

        return ApiBuilder;
    }

})();
