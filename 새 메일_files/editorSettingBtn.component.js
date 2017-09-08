(function () {

    'use strict';

    angular
        .module('doorayWebApp.editor')
        .component('editorSettingBtn', {
            templateUrl: 'modules/editor/markdownEditor/editorSettingBtn/editorSettingBtn.html',
            controller: EditorSettingBtn
        });

    /* @ngInject */
    function EditorSettingBtn($scope, RootScopeEventBindHelper, SettingBiz, DefaultMarkdownEditorModeBiz) {
        var $ctrl = this;

        function initEditor() {
            DefaultMarkdownEditorModeBiz.onLoadDefaultEditor().then(function (result) {
                $ctrl.editor = result.editor;
            });
        }

        initEditor();
        RootScopeEventBindHelper.withScope($scope).on(SettingBiz.EVENTS.RESETCACHE, initEditor);

        $ctrl.disableTooltip = function () {
            $ctrl.changeDefaultEditor('wysiwyg');
        };

        $ctrl.changeDefaultEditor = function (value) {
            SettingBiz.updateMySetting('common.write', {
                editor: value
            });
        };
    }

})();
