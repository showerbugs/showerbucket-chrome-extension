/**
 * @ngdoc overview
 * @name doorayWebApp.editor
 * @description
 * # doorayWebApp.editor
 *
 * Config module of the application.
 */

(function () {

    'use strict';

    angular
        .module('doorayWebApp.editor')
        .run(runInitializeFetchDefaultEditor)
        .run(runInitializeSquireInTuiEditor)
        .run(runInitializeOnceCodeMirrorDefineHook)
        .run(runInitalizeOnceCustomTextPaletteExtension);

    /* @ngInject */
    function runInitializeFetchDefaultEditor(DefaultMarkdownEditorModeBiz) {
        DefaultMarkdownEditorModeBiz.fetchDefaultEditor();
    }

    /* @ngInject */
    function runInitializeSquireInTuiEditor($window, sanitizeFilter) {
        //squire의 sanitize해결을 위해 Mock객체를 만들어 놓음
        $window.DOMPurify = {
            isSupported: true,
            sanitize: function (html) {
                var frag = document.createDocumentFragment();
                var nodes = angular.element(sanitizeFilter('<span>' + html + '</span>')).contents();
                nodes.each(function (index, node) {
                    frag.appendChild(node);
                });
                return frag;
            }
        };
    }

    /* @ngInject */
    function runInitializeOnceCodeMirrorDefineHook($rootScope, DOORAY_LAZYLOAD_EVENTS, CodeMirrorInputConverterFactory) {
        //codemirror가 최초 로딩 시 custom text palette를 한번 초기화 수행한다
        var unbindHandler = $rootScope.$on(DOORAY_LAZYLOAD_EVENTS.CODEMIRROR, function (e, CodeMirror) {
            unbindHandler();
            //console.log('runInitializeOnceCodeMirrorInputConverter');
            CodeMirror.defineInitHook(function (cm) {
                var line = 0;
                var doc = cm.getDoc();

                doc.eachLine(function (lineHandle) {
                    CodeMirrorInputConverterFactory(doc, lineHandle.text, line, 0);
                    line++;
                });
            });
        });
    }

    /* @ngInject */
    function runInitalizeOnceCustomTextPaletteExtension($document, $rootScope, CustomTextPalette, DOORAY_LAZYLOAD_EVENTS, _) {

        //tuiEditor가 최초 로딩 시 custom text palette를 한번 초기화 수행한다
        var unbindHandler = $rootScope.$on(DOORAY_LAZYLOAD_EVENTS.TUI_EDITOR, function (e, tuiEditor) {
            unbindHandler();
            //console.log('runInitalizeOnceCustomTextPalette');
            addTuiEditorExtension(tuiEditor);
        });

        function addTuiEditorExtension(tuiEditor) {
            var PALETTE = '<div class="tui-text-palette-container"></div>',
                PALETTE_LAYER = ['<div class="tui-text-palette">',
                    '<div class="palette-body">',
                    '<ul>',
                    '</ul>',
                    '</div>',
                    '</div>'].join('');

            tuiEditor.defineExtension('textPalette', function (editor) {
                var $palette = angular.element(PALETTE),
                    $layer = angular.element(PALETTE_LAYER),
                    textObject = editor.getTextObject(),
                    isCursorInPalette = false,
                    isCursorInCodeBlock = false,
                    paletteCtrl = new CustomTextPalette($palette, $layer),
                    paletteList = editor.options.textPalette.list;

                angular.element(editor.options.el).append($palette);
                //fixed position 속성의 layer 버그를 해결하기 위해 document에 넣어둔다.
                angular.element($document[0].body).append($layer);

                editor.on('change', _.debounce(onChangeEditor, 50));
                editor.on('keyMap', onKeyMapEditor);
                editor.on('keyup', onKeyupEditor);

                editor.on('click', function () {
                    paletteCtrl.inActivePalette();
                    resetTextObject();
                });
                editor.on('blur', function () {
                    if (!isCursorInPalette) {
                        paletteCtrl.inActivePalette();
                    }
                });

                editor.on('stateChange', function (state) {
                    isCursorInCodeBlock = state.codeBlock || state.code;
                });

                editor.on('removeEditor', function () {
                    $layer.off('click');
                    $layer.off('mouseenter');
                    $layer.off('mouseleave');
                    editor.off('convertorAfterMarkdownToHtmlConverted');
                    editor.off('convertorAfterHtmlToMarkdownConverted');
                    $palette.remove();
                    $layer.remove();
                    $palette = null;
                    $layer = null;
                });

                editor.on('changeMode', function () {
                    paletteCtrl.inActivePalette();
                });

                if (editor.options.textPalette.markdownToHtmlConverter) {
                    editor.on('convertorAfterMarkdownToHtmlConverted', editor.options.textPalette.markdownToHtmlConverter);
                }
                if (editor.options.textPalette.htmlToMarkdownConverter) {
                    editor.on('convertorAfterHtmlToMarkdownConverted', editor.options.textPalette.htmlToMarkdownConverter);
                }

                $layer.on('click', 'li', function (ev) {
                    selectPalette(ev, $(ev.currentTarget).index());
                    ev.preventDefault();
                    //editor.focus();
                });

                $layer.on('mouseenter', function () {
                    isCursorInPalette = true;
                });

                $layer.on('mouseleave', function () {
                    isCursorInPalette = false;
                });

                function onChangeEditor() {
                    var palette;

                    if (paletteCtrl.getActivePalette()) {
                        //현제 커서위치까지 텍스트오브젝트의 범위를 확장한다.
                        textObject.setEndBeforeRange(editor.getRange());
                        palette = getTriggerPalette(textObject);

                        if (palette) {
                            resetTextObject();
                            paletteCtrl.inActivePalette();
                            setPaletteWidgetInEditor();
                            paletteCtrl.setActivePalette(palette);
                        } else if (!paletteCtrl.isAllowingChangeEvent) {
                            paletteCtrl.sendQuery(textObject.getTextContent());
                        }

                    } else {
                        resetTextObject();
                        palette = getTriggerPalette(textObject);

                        if (palette) {
                            setPaletteWidgetInEditor();
                            paletteCtrl.setActivePalette(palette);
                        }
                    }
                }

                function resetTextObject() {
                    textObject = editor.getTextObject();
                    textObject.expandStartOffset();
                }

                function setPaletteWidgetInEditor() {
                    editor.addWidget(editor.getRange(), $palette[0]);
                }

                function getTriggerPalette(textObject) {
                    var content = textObject.getTextContent(),
                        isActivePalette = !!paletteCtrl.getActivePalette(),
                        getPrevTextCurriedIndex = _.curryRight(getPrevText)(textObject, isActivePalette);

                    if (isCursorInCodeBlock) {
                        return;
                    }

                    //TODO: composition이 완성되지 않는 윈도우 버그 해결을 위해 임시로 넣은 코드
                    if (isActivePalette && content.length < 2) {
                        return;
                    }

                    return _.filter(paletteList, function (palette) {
                        if (isMatchingTrigger(palette.trigger, content) &&
                            getTriggerCondition(palette)(content, getPrevTextCurriedIndex) && !palette.isHiddenTrigger) {
                            return palette;
                        }
                    })[0];
                }

                function isMatchingTrigger(trigger, contents) {
                    return trigger === contents.slice(-1);
                }

                function getTriggerCondition(palette) {
                    return palette.triggerCondition ?
                        palette.triggerCondition : function (content, getPrevTextCurriedIndex) {
                        var prevText = getPrevTextCurriedIndex(1).trim();
                        return prevText.length === 0 || prevText === ')';
                    };
                }

                function getPrevText(index, textObject, isActivePalette) {
                    if (isActivePalette) {
                        return textObject.getTextContent().slice(-1 - index, -1);
                    } else {
                        return textObject.peekStartBeforeOffset(index);
                    }
                }

                function onKeyupEditor(ev) {
                    paletteCtrl.onKeyup(ev.data);

                    if (paletteCtrl.getActivePalette() && ev.data.keyCode === 8
                        && textObject.getTextContent().length === 0) {
                        paletteCtrl.inActivePalette();
                    }
                }

                function onKeyMapEditor(ev) {
                    if (ev.keyMap === 'ESCAPE') {
                        ev.data.preventDefault();
                        if (!paletteCtrl.getActivePalette()) {
                            $document[0].activeElement.blur();
                        }
                    }

                    paletteCtrl.onKeyPress(ev);

                    if (paletteCtrl.getActivePalette() && ev.keyMap === 'ENTER') {
                        //enter일 경우만 editor에서 처리
                        textObject.setEndBeforeRange(editor.getRange());
                        selectPalette(ev.data);
                    }
                }

                function selectPalette(ev, index) {
                    var replaceText = paletteCtrl.select(editor.isWysiwygMode(), index);
                    if (_.isObject(replaceText)) {
                        ev.preventDefault();
                    } else if (_.isString(replaceText)) {
                        textObject.replaceContent(replaceText);
                        paletteCtrl.inActivePalette();
                        ev.preventDefault();
                    } else {
                        paletteCtrl.inActivePalette();
                    }
                }
            });
        }
    }

})();
