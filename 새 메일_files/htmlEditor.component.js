(function () {

    'use strict';

    angular
        .module('doorayWebApp.editor')
        .component('htmlEditor', {
            templateUrl: 'modules/editor/htmlEditor/htmlEditor.html',
            controller: HtmlEditor,
            bindings: {
                options: '<',
                height: '@',
                body: '=',
                onLoad: '&',
                onFocus: '&',
                onBlur: '&'
            }
        });

    /* @ngInject */
    function HtmlEditor($log, HelperLocaleUtil) {
        var $ctrl = this,
            BUTTON_SET = ['undo', 'redo', 'fontFamily', 'fontSize', '|', 'bold', 'italic', 'underline', 'strikeThrough', '|', 'color', '|',
                'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'align', '|', 'insertTable',
                'insertImage', 'insertLink', 'quote'];

        var defaultOptions = {
            dragInline: false,
            toolbarButtonsSM: BUTTON_SET,
            toolbarButtons: BUTTON_SET,
            toolbarButtonsMD: BUTTON_SET,
            //imageInsertButtons: ['imageBack', '|', 'imageByURL'],
            events: {
                'froalaEditor.initialized': function (ev, editor) {
                    $ctrl.options.setup && $ctrl.options.setup(editor);
                },
                'froalaEditor.image.beforeUpload': function (e, editor, files) {
                    console.log('image before')
                    if (files.length) {
                        var reader = new FileReader();

                        reader.onload = function (e) {
                            var result = e.target.result;
                            editor.image.insert(result, null, null, editor.image.get());
                        };
                        reader.readAsDataURL(files[0]);
                    }
                    return false;
                },
                'froalaEditor.image.beforePasteUpload': function (e, editor, files) {
                    console.log('image befobeforePasteUploadre')
                    if (files.length) {
                        var reader = new FileReader();

                        reader.onload = function (e) {
                            var result = e.target.result;
                            editor.image.insert(result, null, null, editor.image.get());
                        };
                        reader.readAsDataURL(files[0]);
                    }
                    return false;
                }

            },
            //pluginsEnabled: null,
            //iframe: true,
            //htmlAllowedStyleProps: ['font-family', 'font-size', 'background', 'color', 'width', 'text-align', 'vertical-align', 'background-color'],
            height: '100%',
            heightMin: 200,
            pasteDeniedAttrs: ['class', 'id'],
            //useClasses: false,
            tabSpaces: 4,
            linkAlwaysBlank: true,
            imageDefaultAlign: 'left'
        };

        this.$onInit = function () {
            $ctrl.htmlOption = _.assign(defaultOptions, $ctrl.options);

            if ($ctrl.height) {
                _.set($ctrl.htmlOption, 'height', $ctrl.height);

                if ($ctrl.height === 'auto') {
                    _.get($ctrl.htmlOption, 'plugins', []).push('autoresize');
                    _.set($ctrl.htmlOption, 'autoresize_bottom_margin', 10);
                    _.set($ctrl.htmlOption, 'autoresize_min_height', 100);
                }
            }
        };

    }

})();


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
//    content_style: '.mce-content-body {font-size:13px;}',
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
//    table_default_styles: {
//    borderCollapse: 'collapse'
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
//            $log.error('Load image Error: ', error);
//        };
//    };
//    input.click();
//}
