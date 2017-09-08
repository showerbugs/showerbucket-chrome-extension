(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailListReadToolBtn', {
            templateUrl: 'modules/mail/contents/listToolBtns/mailListReadToolBtn/mailListReadToolBtn.html',
            controller: MailListReadToolBtn,
            bindings: {
                isCheckedUnreadMail: '<',
                ngDisabled: '<'
            }
        });

    /* @ngInject */
    function MailListReadToolBtn(MailListItemCheckboxRepository,
                                 MailItemsAction) {
        var $ctrl = this;

        $ctrl.read = read;
        $ctrl.unread = unread;

        function read() {
            return MailItemsAction.readMails(MailListItemCheckboxRepository.getCheckedAllItems());
        }

        function unread() {
            return MailItemsAction.unreadMails(MailListItemCheckboxRepository.getCheckedAllItems());
        }
    }

})();
