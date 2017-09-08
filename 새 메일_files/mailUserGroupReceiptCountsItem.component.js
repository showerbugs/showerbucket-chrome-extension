(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailUserGroupReceiptCountsItem', {
            templateUrl: 'modules/mail/contents/items/mailUserGroupReceiptCountsItem/mailUserGroupReceiptCountsItem.html',
            controller: MailUserGroupReceiptCountsItem,
            bindings: {
                mail: '<'
            }
        });

    /* @ngInject */
    function MailUserGroupReceiptCountsItem(MailListUtil) {
        var $ctrl = this;

        $ctrl.MailListUtil = MailListUtil;
        $ctrl.getReceiptById = getReceiptById;

        function getReceiptById(receiptId) {
            return $ctrl.mail._wrap.refMap.receiptMap(receiptId);
        }
    }

})();
