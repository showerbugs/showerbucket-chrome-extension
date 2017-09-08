(function () {

    'use strict';

    angular
        .module('doorayWebApp.editor')
        .factory('DefaultMarkdownEditorModeBiz', DefaultMarkdownEditorModeBiz);

    /* @ngInject */
    function DefaultMarkdownEditorModeBiz($rootScope, RootScopeEventBindHelper, SettingBiz, $q) {
        var deferred = $q.defer(), defaultEditor;

        RootScopeEventBindHelper.withScope($rootScope).on(SettingBiz.EVENTS.RESETCACHE, fetchDefaultEditor);

        function fetchDefaultEditor() {
            deferred = $q.defer();
            return SettingBiz.fetchMySetting('common.write').then(function (result) {
                var isDefault = result.editor === 'default';

                defaultEditor = isDefault ? 'wysiwyg' : result.editor;
                var response = {
                    editor: defaultEditor,
                    isDefault: isDefault
                };
                deferred.resolve(response);
                return response;
            });
        }

        return {
            fetchDefaultEditor: fetchDefaultEditor,
            onLoadDefaultEditor: function () {
                return deferred.promise;
            },
            getCached: function () {
                return defaultEditor;
            }
        };
    }

})();



