(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('simplePostWriteformPopover', {
            templateUrl: 'modules/project/components/simplePostWriteformPopover/simplePostWriteformBtn.html',
            controller: SimplePostWriteformPopoverBtn
        })
        .controller('SimplePostWriteformPopover', SimplePostWriteformPopover);

    /* @ngInject */
    function SimplePostWriteformPopoverBtn($document, $scope, DigestService, _) {
        var self = this;

        $document.on('click', onClickDocument);

        this.isOpen = false;

        function onClickDocument(event) {
            if (self.isOpen) {
                var target$ = angular.element(event.target);
                if (_.isEmpty(target$.parents('.popover,.tui-text-palette,.message-modal')) && (_.isEmpty(target$.parents('li')) || target$.parents().length > 2)) {
                    self.isOpen = false;
                    DigestService.safeLocalDigest($scope);
                }
            }
        }

        $scope.$on('$destroy', function () {
            $document.off('click', onClickDocument);
        });
    }

    /* @ngInject */
    function SimplePostWriteformPopover($document, $element, $scope, $timeout, $window, KEYMAP, ITEM_TYPE, SYNTAX_REGEX, CommonItemList, FileService, HelperPromiseUtil, MessageModalFactory, PostTempSaveStorage, StateParamsUtil, TaskListBiz, TaskSubmitFormRouterFactory, gettextCatalog, DoorayLazyLoad, _) {
        var self = this,
            promise,
            isPlaceholderHide = false,
            placeholder$ = $element.find('.dooray-editor-placeholder'),
            submitForm,
            editor,
            REGEX_INDEX = {
                ADDONS: [3, 4],
                MEMBER_TYPE: 7,
                MEMBER_ID: 8
            };

        this.shortcut = {};
        this.shortcut[KEYMAP.SUBMIT] = submit;
        this.shortcut['esc'] = closePopover;
        this.options = {
            markdown: {
                height: 'auto',
                previewStyle: true
            }
        };

        this.onLoadEditor = onLoadEditor;
        this.focusEditor = focusEditor;
        this.submit = submit;

        $scope.$on('$destroy', onDestroy);
        angular.element($window).on('beforeunload', onDestroy);

        _init();

        function onLoadEditor(_editor) {
            editor = _editor;
            focusEditor(editor);

            _editor.on('change', function () {
                var value = _editor.getValue().trim();
                if (value && !isPlaceholderHide) {
                    placeholder$.hide();
                    isPlaceholderHide = true;
                } else if (!value && isPlaceholderHide) {
                    placeholder$.show();
                    isPlaceholderHide = false;
                }
            });
        }

        function submit(withoutClose) {
            if (HelperPromiseUtil.isResourcePending(promise) ||
                self.fileWrapper.isUploading() ||
                (self.fileWrapper.hasNoFiles() && self.form.body.content.trim().length === 0)) {
                return;
            }

            self.pending = true;
            blurEditor();
            var result = _extractSubject(self.form.body.content),
                requestBody = _.cloneDeep(self.form);
            if (result.subject.length === 0) {
                MessageModalFactory.alert(gettextCatalog.getString('제목을 입력해 주세요.'));
                self.pending = false;
                return;
            }
            requestBody.subject = result.subject;
            requestBody.body.content = result.content || '';
            requestBody.users = {
                to: result.to,
                cc: result.cc
            };
            requestBody.fileIdList = self.fileWrapper.getTmpFileIds();

            promise = TaskListBiz.saveSimpleNewPost({projectCode: self.form.projectCode}, [requestBody]).then(function (result) {
                PostTempSaveStorage.removeItemNew(self.form.projectCode);
                var createdPostNumber = result.result()[0].number;
                TaskListBiz.fetchTaskInList({projectCode: self.form.projectCode, postNumber: createdPostNumber}).$promise.then(function (result) {
                    var post = result.contents();
                    post._getOrSetProp('newPost', true);
                    CommonItemList.addSimplePost(post);
                });

                self.form = null;
                if (withoutClose) {
                    _reset();
                    return;
                }
                closePopover();
            }).finally(function () {
                self.pending = false;
                promise = null;
            });
        }

        function _init() {
            var projectCode = StateParamsUtil.getProjectCodeFilter();
            self.fileWrapper = FileService.createNewInstance(ITEM_TYPE.POST);
            TaskSubmitFormRouterFactory.new({projectCode: projectCode}).then(function (_submitForm) {
                submitForm = _submitForm;
                var storageValue = PostTempSaveStorage.getItemNew(projectCode);
                if (storageValue) {
                    self.form = storageValue.value;
                    self.fileWrapper.withTmpFileIds(storageValue.tmpFileIdList);
                    placeholder$.hide();
                    isPlaceholderHide = true;
                } else {
                    self.form = _.cloneDeep(submitForm.form());
                }
            });
        }

        function _reset() {
            _destroy();
            self.form = _.cloneDeep(submitForm.form());
            self.fileWrapper = FileService.createNewInstance(ITEM_TYPE.POST);
            placeholder$.show();
            isPlaceholderHide = false;
            focusEditor(editor);
        }

        function focusEditor(_editor) {
            $timeout(function () {
                _.result(_editor, 'focus', editor.focus());
            }, 0, false);
        }

        function blurEditor() {
            _.result(editor, 'blur');
        }

        function _extractSubject(content) {
            var exec = /(.+)\n?/.exec(content),
                result = {
                    to: [],
                    cc: []
                };
            if (_.isEmpty(exec)) {
                return result;
            }
            var subject = exec[1];
            result.content = content.replace(exec[0], '');

            exec = SYNTAX_REGEX.mentionWithAddon.exec(subject);
            while(exec) {
                subject = subject.replace(exec[0], '');
                var target = result.cc;
                _.forEach(REGEX_INDEX.ADDONS, function (index) {
                    target = exec[index] ? result.to : target;
                });
                target.push(exec[REGEX_INDEX.MEMBER_TYPE] === 'members' ? {
                    type: 'member',
                    member: { organizationMemberId: exec[REGEX_INDEX.MEMBER_ID] }
                } : {
                    type: 'group',
                    group: { projectMemberGroupId: exec[REGEX_INDEX.MEMBER_ID] }
                });
                exec = SYNTAX_REGEX.mentionWithAddon.exec(subject);
            }

            DoorayLazyLoad.loadDoorayRenderer().then(function (markdownItRenderer) {
                subject = markdownItRenderer.render(subject);
                subject = subject && subject.replace(SYNTAX_REGEX.htmlTag, '').replace(/&nbsp;/g, ' ').replace(/&gt;/g, '>');
                exec = /^(.+)\n?|^[\s\n]+(.+)\n/.exec(subject);
                subject = exec ? (exec[1] ? exec[1] : exec[2]) : '';
                result.subject = subject.substring(0, 300);
            });

            return result;
        }

        function closePopover() {
            $document.click();
        }

        function _destroy() {
            if (self.form) {
                if (self.form.body.content) {
                    PostTempSaveStorage.saveItemNew(self.form, self.fileWrapper.getTmpFileIds());
                } else {
                    PostTempSaveStorage.removeItemNew(self.form.projectCode);
                }
            }
            _.result(self.fileWrapper, 'resetFlowFiles');
            self.fileWrapper = null;
        }

        function onDestroy() {
            angular.element($window).off('beforeunload', onDestroy);
            editor.off('change');
            if (HelperPromiseUtil.isResourcePending(promise)) {
                promise.finally(_destroy);
                return;
            }
            _destroy();
        }

    }

})();
