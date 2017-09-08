(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailContentsListToolbar', {
            templateUrl: 'modules/mail/contents/mailContentsListToolbar/mailContentsListToolbar.html',
            controller: MailContentsListToolbar,
            bindings: {
                actionButtonOpts: '<',
                hasCheckedMails: '<'
            }
        });

    /* @ngInject */
    function MailContentsListToolbar(MailFolderRepository, MailListItemCheckboxRepository, MailListRepository,
                                      MailItemsAction, MailItemsCheckboxRangeAction,
                                      StateHelperUtil, _) {
        var $ctrl = this;

        $ctrl.StateHelperUtil = StateHelperUtil;
        $ctrl.MailFolderRepository = MailFolderRepository;

        $ctrl.hasUnreadCheckedMails = hasUnreadCheckedMails;
        $ctrl.isCheckedAll = isCheckedAll;
        $ctrl.toggleCheckAll = toggleCheckAll;

        $ctrl.moveInBox = moveInBox;
        $ctrl.moveSpamBox = moveSpamBox;
        $ctrl.moveArchiveBox = moveArchiveBox;
        $ctrl.moveTrashBox = moveTrashBox;

        $ctrl.removeDraftMails = removeDraftMails;
        $ctrl.removePermanentMails = removePermanentMails;

        // ------- define action methods -------

        function hasUnreadCheckedMails() {
            var checkedMailList = _.map(MailListItemCheckboxRepository.getCheckedAllItems(), MailListRepository.getContentById);
            return _.some(checkedMailList, {mailSummary: {flags: {read: false}}});
        }

        function isCheckedAll() {
            var mailIdList = _extractMailIdListFromCurrentMailList();
            return MailListItemCheckboxRepository.isCheckedAllItems(mailIdList);
        }

        function toggleCheckAll() {
            var mailIdList = _extractMailIdListFromCurrentMailList();
            var bCheckedAll = MailListItemCheckboxRepository.isCheckedAllItems(mailIdList);
            MailListItemCheckboxRepository.clear();
            MailListItemCheckboxRepository.toggleCheckAllItems(mailIdList, !bCheckedAll);
            MailItemsCheckboxRangeAction.clearRange();
        }

        function moveInBox() {
            MailItemsAction.moveInBox(MailListItemCheckboxRepository.getCheckedAllItems());
        }

        function moveSpamBox() {
            MailItemsAction.moveSpamBox(MailListItemCheckboxRepository.getCheckedAllItems());
        }

        function moveArchiveBox() {
            MailItemsAction.moveArchiveBox(MailListItemCheckboxRepository.getCheckedAllItems());
        }

        function moveTrashBox() {
            MailItemsAction.moveTrashBox(MailListItemCheckboxRepository.getCheckedAllItems());
        }

        function removeDraftMails() {
            MailItemsAction.removePermanent(MailListItemCheckboxRepository.getCheckedAllItems());
        }

        function removePermanentMails() {
            MailItemsAction.removePermanentWithConfirm(MailListItemCheckboxRepository.getCheckedAllItems());
        }

        function _extractMailIdListFromCurrentMailList() {
            return _.map(MailListRepository.getContents(), 'id');
        }
    }

})();
