(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .component('doorayCommentWriteform', {
            templateUrl: 'modules/components/doorayCommentWriteform/doorayCommentWriteform.html',
            controller: CommentWriteformCtrl,
            bindings: {
                item: '<',
                comments: '<',
                editTargetComment: '<?',
                applyCommentWrapper: '&',
                onSubmit: '&',
                triggerBlur: '&onBlur',
                triggerFocus: '&onFocus',
                onHideUpdateCommentEditor: '&hideUpdateCommentEditor',
                allowEditor: '<?',
                itemType: '@',
                simpleMode: '@',
                editorHeight: '@',
                isFocusEditor: '@'
            }
        });

    /* @ngInject */
    function CommentWriteformCtrl($scope, $element, $timeout, $window, EMIT_EVENTS, KEYMAP, ITEM_TYPE, CommentWriteformBuilder, HelperPromiseUtil, PaletteBiz, RootScopeEventBindHelper, _) {
        var self = this,
            promise = null,
            _editor = null,
            searchBoostParam = {};

        searchBoostParam[ITEM_TYPE.POST] = function (item) {
            return {
                projectCode: item.projectCode,
                postNumber: item.number
            };
        };
        searchBoostParam[ITEM_TYPE.SCHEDULE] = function (item) {
            return {
                scheduleId: item.id
            };
        };

        self.fileWrapper = null;
        self.shortcut = {};
        self.shortcut[KEYMAP.SUBMIT] = submit;
        self.targetComment = self.editTargetComment || {
                body: {
                    content: '',
                    mimeType: 'text/x-markdown'
                }
            };
        self.options = {
            markdown: {
                previewStyle: !self.simpleMode,
                minimumPreviewModeWidth: 850
            }
        };

        this.$onChanges = function (changes) {
            if (!changes.item || _.isEmpty(self.item)) {
                return;
            }
            if (!self.commentWriteform) {
                init();
            }
            if (self.item && self.commentWriteform) {
                self.commentWriteform.withItem(self.item);
                self.commentWriteform.restoreFromStorage();
                self.commentWriteform.withComments(self.comments);
            }
        };

        self.scrollBottomWhenFilesAdded = scrollBottomWhenFilesAdded;
        self.hideUpdateCommentEditor = hideUpdateCommentEditor;
        self.writeComment = writeComment;
        self.editComment = editComment;
        self.isSubmitPending = isSubmitPending;
        self.onBlur = onBlur;
        self.onFocus = onFocus;
        self.onLoadEditor = onLoadEditor;

        function submit() {
            _.get(self.editTargetComment, 'id') ? self.editComment() : self.writeComment();
        }

        function scrollBottomWhenFilesAdded() {
            //파일 목록 추가 완료 후 스크롤 하단으로 이동시킴
            $timeout(function () {
                var elLastItem = $element.find('.upload-file-wrapper li:last')[0];
                if (elLastItem) {
                    elLastItem.scrollIntoView();
                }
            }, 0, false);
        }

        function hideUpdateCommentEditor() {
            self.onHideUpdateCommentEditor();
        }

        function writeComment() {
            if (!HelperPromiseUtil.isResourcePending(promise)) {
                promise = self.commentWriteform.writeComment().then(function (result) {
                    self.onSubmit(result);
                });
            }
            return promise;
        }

        function editComment() {
            if (!HelperPromiseUtil.isResourcePending(promise)) {
                promise = self.commentWriteform.editComment().then(function () {
                    self.hideUpdateCommentEditor();
                    self.onSubmit();
                });
            }
            return promise;
        }

        function removeTmpFile(file) {
            self.commentWriteform.removeTmpFile(file);
        }

        function isSubmitPending() {
            return _.result(self.commentWriteform, 'isSubmitPending');
        }

        function onBlur() {
            return self.triggerBlur({source: $element});
        }

        function onFocus() {
            PaletteBiz.setSearchBoost(searchBoostParam[self.itemType](self.item));
            var result = self.triggerFocus();
            result && _.isFunction(result.catch) && result.catch(function () {
                _.result(_editor, 'blur');
            });
        }

        function onLoadEditor(editor) {
            _editor = editor;
            RootScopeEventBindHelper.withScope($scope).on(EMIT_EVENTS.RESIZE_NAVI, function () {
                angular.element($window).trigger('resize');
            }).on(EMIT_EVENTS.RESIZE_VIEW, function () {
                angular.element($window).trigger('resize');
            });
            if (self.isFocusEditor) {
                $timeout(function () {
                    editor.focus();
                }, 0, false);
            }
        }

        function initCommentWriteformBuilder() {
            self.commentWriteform = self.editTargetComment ?
                new CommentWriteformBuilder.EditBuilder(self.itemType, self.editTargetComment) :
                new CommentWriteformBuilder.NewBuilder(self.itemType, self.targetComment);
            self.commentWriteform.withApplyCommentWrapper(function (comment) {
                self.applyCommentWrapper({historyEvent: comment});
            });
        }

        function init() {
            initCommentWriteformBuilder();
            self.fileWrapper = self.commentWriteform.fileWrapper;

            $scope.fileservice = {
                cancelUploadFile: self.fileWrapper.cancelUploadFile,
                removeTmpFile: removeTmpFile
            };
        }

        init();

        self.$onDestroy = onDestroy;

        function onDestroy() {
            self.commentWriteform && self.commentWriteform.destroy();
            self.fileWrapper = null;
            self.commentWriteform = null;
        }

        $scope.$on('$stateChangeStart', onDestroy);
    }

})();
