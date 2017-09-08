(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailFullListCheckboxItem', {
            templateUrl: 'modules/mail/contents/fullListItems/mailFullListCheckboxItem/mailFullListCheckboxItem.html',
            controller: MailFullListCheckboxItem,
            bindings: {
                mail: '<'
            }
        });

    /* @ngInject */
    function MailFullListCheckboxItem(MailReceiptItemUtil,
                                       MailListItemCheckboxRepository,
                                       MailItemsCheckboxRangeAction) {
        var $ctrl = this;

        $ctrl.MailReceiptItemUtil = MailReceiptItemUtil;
        $ctrl.MailItemsCheckboxRangeAction = MailItemsCheckboxRangeAction;
        $ctrl.MailListItemCheckboxRepository = MailListItemCheckboxRepository;
    }

})();
