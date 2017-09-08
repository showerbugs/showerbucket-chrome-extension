(function () {

    'use strict';

    angular
        .module('doorayWebApp.editor')
        .directive('markdownEditor', MarkdownEditor);

    /* @ngInject */
    function MarkdownEditor($compile, $window, $timeout, FileService, MessageModalFactory, PaletteBiz, gettextCatalog, DOORAY_COLORS,
                            CodeMirrorChangeEventAdapter, DoorayLazyLoad, _) {
        var regexImageType = /^image\//,
            IMAGE_MAX_SIZE = Math.pow(1024, 2) + (1024 * 256),  //1024MB 이미지를 data uri로 변경 시 대략적인 값
            CONTENT_COMPILE_ELEMENT = ['.mention-markdown', '.task-reference'].join(', ');

        return {
            template: '<div class="markdown-editor"></div>',
            replace: true,
            restrict: 'E',
            scope: {
                fileFlow: '=flow',
                config: '<',
                body: '=',
                onLoad: '&'
            },
            link: function postLink(scope, element, attrs) {
                scope.config = scope.config || {};
                var height = _.get(scope.config, 'height', 222);
                var flow = scope.fileFlow ? scope.fileFlow : FileService.createNewInstance().flowObject;
                var _editor = null, promiseTuiEditor = null, bodyWatchHandler;

                if (attrs.resizeFit) {
                    height = 'auto';
                    element.addClass('resize-fit');
                }

                promiseTuiEditor = DoorayLazyLoad.loadTuiEditor().then(function () {
                    element.tuiEditor({
                        previewStyle: scope.config.previewStyle || 'tab',
                        height: height,
                        hooks: {
                            'addImageBlobHook': uploadImage
                        },
                        textPalette: {
                            markdownToHtmlConverter: PaletteBiz.markdownToHtmlConverter,
                            htmlToMarkdownConverter: PaletteBiz.htmlToMarkdownConverter,
                            list: [PaletteBiz.mention, PaletteBiz.link, PaletteBiz.task, PaletteBiz.emoji]
                        },
                        language: scope.config.language,
                        initialEditType: _.get(scope.config, 'initialEditType'),
                        exts: ['textPalette', 'colorSyntax', 'scrollFollow'],
                        colorSyntax: {
                            preset: DOORAY_COLORS
                        },
                        events: {
                            'load': function (editor) {
                                _editor = editor;

                                var updateValue = _.debounce(function () {
                                    _.set(scope.body, 'content', editor.getValue());
                                }, 0);

                                editor.on('change', function () {
                                    //_.set(scope.body, 'content', editor.getValue());
                                    updateValue();
                                });

                                editor.on('previewRenderAfter', function () {
                                    $compile(element.find(CONTENT_COMPILE_ELEMENT))(scope);
                                });

                                editor.on('colorButtonClicked', function () {
                                    $compile(element.find('.tui-colorpicker-container'))(scope);
                                });

                                bodyWatchHandler = scope.$watch('body', function (newVal) {
                                    if (newVal && newVal.content !== editor.getValue()) {
                                        editor.setValue(newVal.content || '');
                                        editor.eventManager.emit('previewNeedsRefresh');
                                    }
                                });

                                editor.on('changeMode', changePreviewMode);
                                if (scope.config.minimumPreviewModeWidth) {
                                    angular.element($window).on('resize', changePreviewMode);
                                }

                                insertMarkdownHelpBtn();
                                editor.eventManager.emit('changeMode');

                                scope.config.setup && scope.config.setup(editor);

                                $timeout(function () {
                                    editor.getCodeMirror().refresh();
                                    CodeMirrorChangeEventAdapter.attachEventsFromElement(element);
                                    scope.onLoad({editor: editor, element: element});
                                }, 0, false);
                            }
                        }
                    });

                });


                var successCb, failCb;

                function changePreviewMode() {
                    if (_editor.isMarkdownMode()) {
                        _editor.changePreviewStyle(_editor.layout.$el.width() >= scope.config.minimumPreviewModeWidth ? 'vertical' : 'tab');
                    }
                }

                function uploadImage(file, callback) {
                    if (!regexImageType.test(file.type)) {
                        return;
                    }

                    if (scope.config.isTemplate) {
                        replaceImageBase64(callback, file);
                        return;
                    }

                    if (!file.name) {
                        file.name = generateFileName(file.type);
                    }

                    flow.opts.query.type = 'inline_image';
                    flow.addFile(file);
                    flow.upload();
                    successCb = replaceImageFilePath.bind(null, callback);
                    failCb = replaceImageBase64.bind(null, callback);
                    flow.on('fileSuccess', successCb);
                    flow.on('fileError', failCb);
                }

                function replaceImageFilePath(callback, file) {
                    callback('/files/' + file.response.id);
                    offFlowEvent();
                }

                function replaceImageBase64(callback, file) {
                    var reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = function (e) {
                        if (e.target.result.length > IMAGE_MAX_SIZE) {
                            MessageModalFactory.alert(gettextCatalog.getString('1MB 이상의 이미지는 추가할 수 없습니다.'));
                            return;
                        }
                        callback(e.target.result);
                    };
                    offFlowEvent();
                }

                function generateFileName(type) {
                    return 'Inline-image-' + moment().format('YYYY-MM-DD HH.mm.ss.SSS') + '.' + type.replace('image/', '');
                }

                function offFlowEvent() {
                    flow.off('fileSuccess', successCb);
                    flow.off('fileError', failCb);
                    delete flow.opts.query.type;
                }

                function insertMarkdownHelpBtn() {
                    var $markdownHelpBtn = angular.element('<a class="markdown-help" href="/htmls/guides/markdown_' + (scope.config.language === 'zh_CN' ? 'en_US' : scope.config.language) + '.html" target="_blank">' + gettextCatalog.getString("마크다운 도움말") + '</a>');
                    _editor._ui.toolbar.$buttonContainer.append($markdownHelpBtn);
                    _editor.on('changeMode', function () {
                        if (_editor.isMarkdownMode()) {
                            $markdownHelpBtn.show();
                        } else {
                            $markdownHelpBtn.hide();
                        }
                    });
                }

                scope.$on('$destroy', function () {
                    angular.element($window).off('resize', changePreviewMode);
                    //TODO 에디터에서 remove시 자체적으로 메모리 해제를 시켜줘야함
                    element.removeData();

                    promiseTuiEditor.finally(function () {
                        if (_editor) {
                            _editor.off('load');
                            _editor.off('change');
                            _editor.off('previewRenderAfter');
                            _editor.off('colorButtonClicked');
                            _editor.off('changeMode');

                            bodyWatchHandler();
                            changePreviewMode();

                            _editor.remove();
                            _editor = null;
                        }
                    });

                    offFlowEvent();
                    flow = null;
                });
            }
        };
    }

})();

