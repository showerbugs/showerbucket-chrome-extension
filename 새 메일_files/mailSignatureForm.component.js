(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .component('mailSignatureForm', {
            templateUrl: 'modules/setting/user/mailSignatureSetting/MailSignatureModalFactory/mailSignatureForm/mailSignatureForm.html',
            controller: MailSignatureForm,
            bindings: {
                mode: '@',
                index: '<',
                name: '<',
                content: '<',
                dismiss: '&',
                close: '&'
            }
        });

    /* @ngInject */
    function MailSignatureForm($scope, MIME_TYPE, HelperFormUtil, MailSignatureRepository, gettextCatalog) {
        var $ctrl = this;

        $ctrl.FORM_NAME = 'signatureDetailForm';

        $ctrl.submit = submit;
        $ctrl.changeEditor = changeEditor;

        this.$onInit = function () {
            changeEditor('editor');
            $ctrl.body = {
                mimeType: MIME_TYPE.HTML.TYPE,
                content: $ctrl.content
            };
            $ctrl.namePlaceholder = [
                gettextCatalog.getString('서명'),
                ' (', _getIndex() + 1, ')'
            ].join('');

            HelperFormUtil.bindService($scope, $ctrl.FORM_NAME);
        };

        function submit() {
            if (HelperFormUtil.checkInvaild($scope[$ctrl.FORM_NAME]) ||
                !$ctrl.body.content || $ctrl.body.content.length > 5000) {
                return;
            }

            var form = {
                name: $ctrl.name || $ctrl.namePlaceholder,
                content: $ctrl.body.content
            };
            var info = MailSignatureRepository.getContent();
            info.signatures = info.signatures.slice();
            info.signatures.splice(_getIndex(), 1, form);
            MailSignatureRepository.updateContent(info).then(function () {
                $ctrl.close();
            });
        }

        function changeEditor(editor) {
            $ctrl.currentEditor = editor;
        }

        function _getIndex() {
            return $ctrl.mode === 'create' ? MailSignatureRepository.getContent().signatures.length : $ctrl.index;
        }

    }

})();
