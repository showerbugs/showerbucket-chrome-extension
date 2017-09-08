(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailVerticalListReceiptItem', {
            templateUrl: 'modules/mail/contents/verticalSplitItems/mailVerticalListReceiptItem/mailVerticalListReceiptItem.html',
            controller: MailVerticalListReceiptItem,
            bindings: {
                receipt: '<'
            }
        });

    /* @ngInject */
    function MailVerticalListReceiptItem(MailListUtil, MailReceiptItemUtil) {
        this.MailListUtil = MailListUtil;
        this.MailReceiptItemUtil = MailReceiptItemUtil;
    }

})();
