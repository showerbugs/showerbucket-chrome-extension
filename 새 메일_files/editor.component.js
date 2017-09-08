(function () {

    'use strict';

    angular
        .module('doorayWebApp.editor')
        .component('editor', {
            templateUrl: 'modules/editor/editor.html',
            transclude: {
                rightToolbar: '?rightToolbar',
                topToolbar: '?topToolbar'
            },
            controller: EditorController,
            bindings: {
                body: '=',
                flow: '=',
                height: '@',
                allowEditorOption: '=allowEditor',
                onLoad: '&',
                onFocus: '&',
                onBlur: '&',
                onChangeMode: '&',
                options: '<'
            }
        });

    /* @ngInject */
    function EditorController(DefaultMarkdownEditorModeBiz, MessageModalFactory, HelperLocaleUtil, MIME_TYPE, HelperConfigUtil, PopupUtil, gettextCatalog, _) {
        var EDITOR_TAB = {
            HTML: {
                type: MIME_TYPE.HTML.type,
                mode: MIME_TYPE.HTML.mode.html
            },
            MARKDOWN: {
                type: MIME_TYPE.MARKDOWN.type,
                mode: MIME_TYPE.MARKDOWN.mode.markdown
            },
            WYSIWYG: {
                type: MIME_TYPE.MARKDOWN.type,
                mode: MIME_TYPE.MARKDOWN.mode.wysiwyg
            }
        };



        var default_option = {
            html: {
                setup: function (editor) {
                    if (!$ctrl.editor) {
                        $ctrl.onLoad({editor: editor});
                    }
                    $ctrl.editor = editor;
                }
            },
            markdown: {
                setup: function (editor) {
                    if (!$ctrl.editor) {
                        $ctrl.onLoad({editor: editor});
                    }
                    if (!$ctrl.options.markdown.initialEditType) {
                        DefaultMarkdownEditorModeBiz.onLoadDefaultEditor().then(function (result) {
                            $ctrl.editor.changeMode(result.editor);
                        });
                    }
                    $ctrl.editor = editor;

                    editor.on('focus', function () {
                        $ctrl.onFocus();
                    });
                    editor.on('blur', function () {
                        $ctrl.onBlur();
                    });
                },
                isTemplate: false,
                language: HelperLocaleUtil.getLanguage(),
                initialEditType: DefaultMarkdownEditorModeBiz.getCached()
            }
        };

        var $ctrl = this;
        $ctrl.MIME_TYPE = MIME_TYPE;

        $ctrl.$onInit = function () {
            $ctrl.options = _.merge(default_option, $ctrl.options);
            setHeight();
            $ctrl.allowEditor = $ctrl.allowEditorOption || (HelperConfigUtil.enableNewFeature() ? ['HTML', 'MARKDOWN'] : ['MARKDOWN']);
        };


        $ctrl.changeMode = function (mode) {
            if (checkMimeType($ctrl.body.mimeType, 'MARKDOWN') &&
                checkMimeType(EDITOR_TAB[mode].type, 'MARKDOWN')) {
                $ctrl.editor.changeMode(EDITOR_TAB[mode].mode);
                $ctrl.onChangeMode({mode: mode});
                return;
            }

            if (isSameMimeTypeToCurrentTab(mode)) {
                return;
            }

            changeEditor(mode);
        };

        $ctrl.isActiveTab = function (mode) {
            return isSameMimeTypeToCurrentTab(mode) && $ctrl.editor &&
                (checkMimeType(EDITOR_TAB[mode].type, 'MARKDOWN') ? $ctrl.editor.currentMode === EDITOR_TAB[mode].mode : true);
        };

        $ctrl.$onDestroy = function () {
            $ctrl.editor && $ctrl.editor.off('click blur focus');
            $ctrl.editor = null;
        };

        function setHeight() {
            var height = $ctrl.height;
            if (!height) {
                return;
            }
            _.set($ctrl.options, 'html.height', height);
            _.set($ctrl.options, 'markdown.height', height);
        }

        function checkMimeType(mimeType, type) {
            return mimeType === MIME_TYPE[type].type;
        }

        function isSameMimeTypeToCurrentTab(mode) {
            return _.get($ctrl.body, 'mimeType') === EDITOR_TAB[mode].type;
        }

        function changeEditor(mode) {
            $ctrl.options.markdown.initialEditType = EDITOR_TAB[mode].mode;

            if ($ctrl.body.content.trim().length === 0) {
                $ctrl.body.mimeType = EDITOR_TAB[mode].type;
                $ctrl.onChangeMode({mode: mode});
                return;
            }

            MessageModalFactory.confirm([
                '<p>', gettextCatalog.getString('편집기를 변경하면 작성 중이던 내용이 사라집니다.'), '</p>',
                '<p>', gettextCatalog.getString('변경하시겠습니까?'), '</p>'
            ].join('')).result.then(function () {
                $ctrl.body.content = '';
                $ctrl.body.mimeType = EDITOR_TAB[mode].type;
                $ctrl.onChangeMode({mode: mode});
            });
        }

        $ctrl.openTranslator = function () {
            var content = $ctrl.body.mimeType === MIME_TYPE.MARKDOWN.type ?
                angular.element($ctrl.editor.getHtml()).text() : $ctrl.editor.$el[0].innerText;

            var ref = PopupUtil.openTranslatorPopup();

            ref.content = content;
            ref.editor = $ctrl.editor;
            ref.model = $ctrl.body;
        };
    }

})();
//
//baseURL: "/bower_components/tinymce",
//    setup: function (editor) {
//    if (!$ctrl.editor) {
//        $ctrl.onLoad({editor: editor});
//    }
//    $ctrl.editor = editor;
//    editor.on("click", function () {
//        $ctrl.onFocus();
//    });
//    editor.on('blur', function () {
//        $ctrl.onBlur();
//    });
//},
//theme: 'modern',
//    skin: 'lightgray',
//    menubar: '',
//    statusbar: false,
//    language_url: HelperLocaleUtil.getLanguage() === 'en_US' ? '' : '/app/statics/tinymce/lang/' + HelperLocaleUtil.getLanguage() + '.js',
//    //TODO: css 상속
//    content_style: '.mce-content-body {font-size:13px;}' +
//'.mce-item-table.dooray-custom-table, .mce-item-table.dooray-custom-table td, .mce-item-table.dooray-custom-table th, .mce-item-table.dooray-custom-table caption{border-style: solid; border-collapse: collapse;}',
//    plugins: [
//    "paste image link imagetools contextmenu textcolor colorpicker table nonbreaking"
//],
//    toolbar: "insertfile undo redo | styleselect | fontsizeselect heading bold italic strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table | image link blockquote",
//    target_list: false,
//    paste_data_images: true,
//    default_link_target: "_blank",
//    file_picker_types: 'image',
//    image_title: true,
//    image_description: false,
//    inline_styles: true,
//    fontsize_formats: '7pt 8pt 9pt 10pt 11pt 12pt 14pt 18pt 24pt 36pt',
//    keep_styles: true,
//    table_default_attributes: {
//class: 'dooray-custom-table'
//},
//nonbreaking_force_tab: true,
//    file_picker_callback: function (callback) {
//    var input = document.createElement('input');
//    input.setAttribute('type', 'file');
//    input.setAttribute('accept', 'image/*');
//    input.onchange = function () {
//        var file = this.files[0];
//        var reader = new FileReader();
//        var id = 'blobid' + (new Date()).getTime();
//        var blobCache = tinymce.activeEditor.editorUpload.blobCache;
//
//        reader.readAsDataURL(file);
//        reader.onload = function (e) {
//            var blobInfo = blobCache.create(id, file, e.target.result.split(',')[1]);
//            blobCache.add(blobInfo);
//            callback(blobInfo.blobUri(), {title: file.name});
//        };
//        reader.onerror = function (error) {
//            console.error('Load image Error: ', error);
//        };
//    };
//    input.click();
//}


