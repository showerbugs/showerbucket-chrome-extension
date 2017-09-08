(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .service('CommentWriteformBuilder', CommentWriteformBuilder);

    /* @ngInject */
    function CommentWriteformBuilder($q, ITEM_TYPE, CalendarEventBiz, CommentWriteformApiBuilder, FileService, HelperPromiseUtil, ItemSyncService, MessageModalFactory, PostEventBiz, PostTempSaveStorage, ScheduleTempSaveStorage, gettextCatalog, _) {
        var tempSaveStorage = {},
            eventBiz = {};
        tempSaveStorage[ITEM_TYPE.POST] = PostTempSaveStorage;
        tempSaveStorage[ITEM_TYPE.SCHEDULE] = ScheduleTempSaveStorage;
        eventBiz[ITEM_TYPE.POST] = PostEventBiz;
        eventBiz[ITEM_TYPE.SCHEDULE] = CalendarEventBiz;

        var CommentWriteformAbstractClass = angular.element.inherit({
            __constructor: function (type, targetComment) {
                this.type = type || ITEM_TYPE.POST;

                this.fileWrapper = FileService.createNewInstance(type);
                this.tempSaveStroage = tempSaveStorage[type];
                this.eventBiz = eventBiz[type];
                this.item = null;
                this.submitPromise = null;
                this.targetComment = targetComment;
                this.comments = [];
            },
            withItem: function (item) {
                this.item = item;
                return this;
            },
            withComments: function (comments) {
                this.comments = comments;
                return this;
            },
            withApplyCommentWrapper: function (applyCommentWrapper) {
                this.applyCommentWrapper = applyCommentWrapper;
                return this;
            },
            isSubmitPending: function () {
                return HelperPromiseUtil.isResourcePending(this.submitPromise);
            },
            isEmptyContent: function () {
                var text = this.targetComment.body.content;
                return !(text && text.trim());
            },
            setTextInEditor: function (content, mimeType) {
                if (mimeType && content) {
                    this.targetComment.body = {
                        content: content,
                        mimeType: mimeType
                    };
                }
            },
            removeTmpFile: function (file) {
                if (this.isSubmitPending()) {
                    return;
                }
                this.submitPromise = this.fileWrapper.removeTmpFile(file);
            },
            createForm: function () {
                return CommentWriteformApiBuilder.paramFactory.makeCreateForm(this);
            },
            destroy: function () {
                var self = this;
                if (!this.submitPromise) {
                    self._destroy();
                    return;
                }
                this.submitPromise.finally(function () {
                    self._destroy();
                });
            },
            _destroy: function () {
                this.saveCommentToStorage();
                this.saveDraftToStorage();
                this.fileWrapper.resetFlowFiles();
                this.submitPromise = null;
                this.comments = null;
                this.item = null;
                this.type = null;
                this.targetComment = null;
                this._destroyed = true;
            },
            applyCommentWrapper: angular.noop
        });

        var NewCommentWriteformClass = angular.element.inherit(CommentWriteformAbstractClass, {
            __constructor: function (type, targetComment) {
                this.__base(type, targetComment);
                this._createCommentApi = makeCreateComment(this);
            },
            isValidContent: function () {
                return !this.isEmptyContent() && !this.isSubmitPending();
            },
            writeComment: function () {
                var fileWrapper = this.fileWrapper;
                if (fileWrapper.isUploading()) {
                    MessageModalFactory.alert(gettextCatalog.getString('파일 업로드 완료 후 등록이 가능합니다.'));
                    return $q.reject();
                }

                if (fileWrapper.hasNoFiles() && !this.isValidContent()) {
                    return $q.reject();
                }

                return this._createCommentApi();
            },
            saveCommentToStorage: function () {
                if (!this.item) {
                    return;
                }
                if (this.isEmptyContent()) {
                    this.tempSaveStroage.removeCommentNew(this.item.id);
                    return;
                }
                this.tempSaveStroage.saveCommentNew(this.item.id, this.createForm(), this.fileWrapper.getTmpFileIds());
            },
            saveDraftToStorage: function () {
                var lastComment = _.last(this.comments);
                if (this.item && _.get(lastComment, '_isDraft')) {
                    var form = this.createForm();
                    _.assign(form.body, lastComment.body);
                    this.tempSaveStroage.saveCommentNew(this.item.id, form, this.fileWrapper.getTmpFileIds());
                }
            },
            restoreFromStorage: function () {
                var itemId = _.get(this.item, 'id'),
                    storageItem = this.tempSaveStroage.getCommentNew(itemId);
                var body = _.get(storageItem, 'value.body', {});
                this.fileWrapper.withTmpFileIds(_.get(storageItem, 'tmpFileIdList', []));
                this.tempSaveStroage.removeCommentNew(itemId);

                this.setTextInEditor(body.content, body.mimeType);
            }
        });

        var EditCommentWriteformClass = angular.element.inherit(CommentWriteformAbstractClass, {
            __constructor: function (type, targetComment) {
                this.__base(type, targetComment);
                this._editCommentApi = makeEditCommentApi(this);
            },
            updateMultiFileDependency: function () {
                var pathParams = CommentWriteformApiBuilder.paramFactory.makeDefaultForm(this.item, this.type);
                pathParams.eventId = this.targetComment.id;
                this.fileWrapper.updateMultiFileDependency(pathParams);
            },
            editComment: function () {
                if (this.fileWrapper.isUploading()) {
                    MessageModalFactory.alert(gettextCatalog.getString('파일 업로드 완료 후 등록이 가능합니다.'));
                    return;
                }

                this.updateMultiFileDependency();
                return this._editCommentApi();
            },
            saveCommentToStorage: function () {
                if (!this.item) {
                    return;
                }
                var commentId = _.get(this.targetComment, 'id');

                if (this.isEmptyContent()) {
                    this.tempSaveStroage.removeCommentUpdate(this.item.id, commentId);
                    return;
                }
                this.tempSaveStroage.saveCommentUpdate(this.item.id, commentId, this.createForm(), this.fileWrapper.getTmpFileIds());
            },
            saveDraftToStorage: function () {
                if (this.item && this.targetComment._isDraft) {
                    var commentId = _.get(this.targetComment, 'eventId'),
                        form = this.createForm();
                    _.assign(form.body, this.targetComment.body);
                    this.tempSaveStroage.saveCommentUpdate(this.item.id, commentId, form, this.fileWrapper.getTmpFileIds());
                }
            },
            restoreFromStorage: function () {
                var self = this,
                    itemId = _.get(this.item, 'id'),
                    commentId = _.get(this.targetComment, 'id'),
                    storageItem = this.tempSaveStroage.getCommentUpdate(itemId, commentId);
                this.tempSaveStroage.removeCommentUpdate(itemId, commentId);

                //기존에디터의 type과 text가 동일하면 해당 confirm 무시함
                var currentType = this.targetComment.body.mimeType, currentText = this.targetComment.body.content;
                var storageType = _.get(storageItem, 'value.body.mimeType'), storageText = _.get(storageItem, 'value.body.content');
                if (!storageItem || (_.isEqual(currentType, storageType) && _.isEqual(currentText, storageText))) {
                    return;
                }

                MessageModalFactory.confirm(['<p>', gettextCatalog.getString('작성 중이던 댓글이 있습니다.'), '</p>'].join(''), '', {
                    confirmBtnLabel: gettextCatalog.getString('이어쓰기')
                }).result.then(function () {
                        self.setTextInEditor(storageText, storageType);
                        self.fileWrapper.withTmpFileIds(_.get(storageItem, 'tmpFileIdList', []));
                    });
            }
        });

        var DeleteCommentDummyClass = angular.element.inherit(CommentWriteformAbstractClass, {
            __constructor: function (type, targetComment) {
                this.type = type;
                this.eventBiz = eventBiz[type];
                this.targetComment = targetComment;
                this._deleteCommentApi = makeDeleteCommentApi(this);
            },
            deleteComment: function () {
                return this._deleteCommentApi();
            }
        });

        function makeCreateComment(commentWriteform) {
            var item, type, createCommentFunc;
            createCommentFunc = new CommentWriteformApiBuilder(commentWriteform)
                .withApi(commentWriteform.eventBiz.save)
                .withBeforeCallback(function (commentWriteform, self) {
                    item = _.get(commentWriteform, 'item');
                    type = _.get(commentWriteform, 'type');
                    self.withParam(CommentWriteformApiBuilder.paramFactory.makeCreateForm(commentWriteform));
                })
                .withPostErrorHandle(function () {
                    return createCommentFunc();
                })
                .withDraftComment()
                .withRefreshItem()
                .withResetFiles()
                .withSetEmptyEditor()
                .withAfterCallback(function () {
                    if (!_.isEmpty(item)) {
                        commentWriteform.tempSaveStroage.removeCommentNew(item.id);
                        commentWriteform.targetComment.body.content = '';
                        commentWriteform.targetComment.body = {
                            content: '',
                            mimeType: commentWriteform.targetComment.body.mimeType
                        };
                    }
                })
                .withErrorCallback(function () {
                    MessageModalFactory.alert([
                            '<p class="text-center">', gettextCatalog.getString('댓글이 정상적으로 등록되지 않았습니다.'), '</p>',
                            '<p class="text-center">', gettextCatalog.getString('다시 한번 시도해 주세요.'), '</p>'
                        ].join(''));
                    ItemSyncService.syncCommentsUsingRefresh(item, type).then(function (comments) {
                        commentWriteform.comments = comments;
                    });
                })
                .build();
            return createCommentFunc;
        }

        function makeEditCommentApi(commentWriteform) {
            var item, commentId, type, editCommentFunc;
            editCommentFunc = new CommentWriteformApiBuilder(commentWriteform)
                .withApi(commentWriteform.eventBiz.update)
                .withBeforeCallback(function (commentWriteform, self) {
                    item = _.get(commentWriteform, 'item');
                    commentId = _.get(commentWriteform, 'targetComment.id');
                    type = _.get(commentWriteform, 'type');
                    self.withParam(CommentWriteformApiBuilder.paramFactory.makeEditForm(commentWriteform));
                })
                .withPostErrorHandle(function () {
                    return editCommentFunc();
                })
                .withDraftComment()
                .withRefreshItem()
                .withSetEmptyEditor()
                .withAfterCallback(function () {
                    if (!_.isEmpty(item) && commentId) {
                        commentWriteform.tempSaveStroage.removeCommentUpdate(item.id, commentId);
                    }
                })
                .withErrorCallback(function () {
                    MessageModalFactory.alert([
                            '<p class="text-center">', gettextCatalog.getString('댓글이 정상적으로 수정되지 않았습니다.'), '</p>',
                            '<p class="text-center">', gettextCatalog.getString('다시 한번 시도해 주세요.'), '</p>'
                        ].join(''));
                    ItemSyncService.syncCommentsUsingRefresh(item, type).then(function (comments) {
                        commentWriteform.comments = comments;
                    });
                })
                .withResetFiles()
                .build();
            return editCommentFunc;
        }

        function makeDeleteCommentApi(commentWriteform) {
            var item, commentId, type, removeCommentFunc;
            removeCommentFunc = new CommentWriteformApiBuilder(commentWriteform)
                .withApi(commentWriteform.eventBiz.remove)
                .withBeforeCallback(function (commentWriteform, self) {
                    item = _.get(commentWriteform, 'item');
                    commentId = _.get(commentWriteform, 'targetComment.id');
                    type = _.get(commentWriteform, 'type');
                    self.withParam(CommentWriteformApiBuilder.paramFactory.makeDeleteForm(commentWriteform));
                })
                .withPostErrorHandle(function () {
                    return removeCommentFunc();
                })
                .withRemoveComment()
                .withRefreshComments()
                .withAfterCallback(function () {
                    if (!_.isEmpty(item) && commentId) {
                        commentWriteform.tempSaveStroage.removeCommentUpdate(item.id, commentId);
                    }
                })
                .withErrorCallback(function (errorResponse, commentWriteform) {
                    MessageModalFactory.confirm([
                            '<p class="text-center">', gettextCatalog.getString('댓글이 정상적으로 삭제되지 않았습니다.'), '</p>',
                            '<p class="text-center">', gettextCatalog.getString('다시 한번 시도해 주세요.'), '</p>'
                        ].join(''),
                        gettextCatalog.getString('삭제'),
                        {confirmBtnLabel: gettextCatalog.getString('삭제')}).result.then(function () {
                            commentWriteform.deleteComment();
                        }, function () {
                            ItemSyncService.syncCommentsUsingRefresh(item, type).then(function (comments) {
                                commentWriteform.comments = comments;
                            });
                        });
                })
                .build();
            return removeCommentFunc;
        }

        return {
            NewBuilder: NewCommentWriteformClass,
            EditBuilder: EditCommentWriteformClass,
            deleteDummyBuilder: DeleteCommentDummyClass
        };
    }
})();
