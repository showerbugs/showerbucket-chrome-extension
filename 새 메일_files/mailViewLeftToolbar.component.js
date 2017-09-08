(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailViewLeftToolbar', {
            templateUrl: 'modules/mail/view/mailViewLeftToolbar/mailViewLeftToolbar.html',
            controller: MailViewLeftToolbar,
            bindings: {
                actionButtonOpts: '<',
                mail: '<',
                menuTranslationInfo: '=',
                setTranslation: '&',
                translationRawContentId: '&'
            }
        });

    /* @ngInject */
    function MailViewLeftToolbar(StateHelperUtil, PopupUtil,
                                 MailItemsAction, MailTranslationStorageAction, TranslateBodyAction,
                                 MailViewOriginalModal, _) {
        var $ctrl = this;

        $ctrl.getListStateName = getListStateName;
        $ctrl.openMailWriteForm = openMailWriteForm;
        $ctrl.openDraftMailWriteForm = openDraftMailWriteForm;
        $ctrl.openViewOriginalModal = openViewOriginalModal;
        $ctrl.removeDraft = removeDraft;
        $ctrl.removeMail = removeMail;
        $ctrl.sizeMailWriteAction = sizeMailWriteAction;
        $ctrl.translateContent = translateContent;
        $ctrl.showTranslation = showTranslation;
        $ctrl.showRawContent = showRawContent;
        $ctrl.hideTranslation = hideTranslation;

        $ctrl.$onChanges = function (changes) {
            if (changes.mail && !_.isEmpty($ctrl.mail)) {
                $ctrl.menuTranslationInfo = MailTranslationStorageAction.loadTranslationInfo($ctrl.mail.id);
                if ($ctrl.translationRawContentId() !== $ctrl.mail.id) {
                    $ctrl.setTranslation({info: $ctrl.menuTranslationInfo});
                }
            }
        };

        function openMailWriteForm(type) {
            PopupUtil.openMailWritePopup(type, {mailId: $ctrl.mail.id});
        }

        function openDraftMailWriteForm() {
            PopupUtil.openMailWritePopup('draft', {draftId: $ctrl.mail.id});
        }

        function openViewOriginalModal() {
            MailViewOriginalModal.open($ctrl.mail.id);
        }

        function removeDraft(mail) {
            MailItemsAction.removePermanent([mail.id]);
        }

        function removeMail(mail) {
            MailItemsAction.moveTrashBox([mail.id]);
        }

        function getListStateName() {
            return StateHelperUtil.computeCurrentListStateName();
        }

        function sizeMailWriteAction() {
            // 답장/전체답장 재전송 전달
            return _($ctrl.actionButtonOpts).pick(['reply', 'replyAll', 'reSend', 'forward']).pickBy(_.identity).keys().size();
        }

        function translateContent(sourceLang, targetLang) {
            $ctrl.translationRawContentId({id: null});
            $ctrl.menuTranslationInfo = {
                sourceLang: sourceLang,
                targetLang: targetLang
            };
            $ctrl.setTranslation({info: $ctrl.menuTranslationInfo});

            MailTranslationStorageAction.saveTranslationInfo($ctrl.mail.id, $ctrl.menuTranslationInfo);
        }

        function showTranslation() {
            $ctrl.translationRawContentId({id: null});
            var translation = TranslateBodyAction.getDefaultTranslation();
            translateContent(translation.sourceLang, translation.targetLang);
        }

        function showRawContent() {
            $ctrl.translationRawContentId({id: $ctrl.mail.id});
            $ctrl.setTranslation({info: null});
        }

        function hideTranslation() {
            $ctrl.menuTranslationInfo = null;
            MailTranslationStorageAction.removeTranslationInfo($ctrl.mail.id);
            showRawContent();
        }

    }

})();
