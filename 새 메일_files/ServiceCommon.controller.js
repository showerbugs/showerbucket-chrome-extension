(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .controller('ServiceCommonCtrl', ServiceCommonCtrl);


    /* @ngInject */
    function ServiceCommonCtrl($q, $scope, SettingBiz, DefaultMarkdownEditorModeBiz, HelperConfigUtil, HelperFormUtil, HelperLocaleUtil, MyInfo, gettextCatalog) {

        $scope.languageList = HelperLocaleUtil.getLanguageList();

        function init() {
            $scope.FORM_NAME = 'serviceCommonForm';
            $scope.setting = {};
            HelperFormUtil.bindService($scope, $scope.FORM_NAME);
            _reset();
        }

        init();

        $scope.submit = submit;
        $scope.cancel = cancel;

        function submit() {
            if (HelperFormUtil.checkInvaild($scope[$scope.FORM_NAME])) {
                return;
            }
            $q.all([
                _updateEditor($scope.setting.editor),
                MyInfo.updateMyInfo({locale: $scope.language, timezoneName: $scope.zoneName})
            ]).then(function () {
                $scope.resultMsg = gettextCatalog.getString("저장되었습니다.");
            }).finally(function () {
                if ($scope.language !== HelperLocaleUtil.getLanguage() ||
                    $scope.zoneName !== HelperConfigUtil.timezone()) {
                    HelperLocaleUtil.setLanguage($scope.language);
                }
            });
        }

        function cancel() {
            _reset();
            $scope.resultMsg = gettextCatalog.getString("취소되었습니다.");
        }

        function _updateEditor(editor) {
            return SettingBiz.updateMySetting('common.write', {
                editor: editor
            });
        }

        function _reset() {
            $scope.language = HelperLocaleUtil.getLanguage();
            $scope.zoneName = HelperConfigUtil.timezone();
            DefaultMarkdownEditorModeBiz.fetchDefaultEditor().then(function (result) {
                $scope.setting.editor = result.editor;
            });
        }
    }
})();
