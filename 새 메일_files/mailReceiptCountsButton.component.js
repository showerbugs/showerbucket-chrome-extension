(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailReceiptCountsButton', {
            templateUrl: 'modules/mail/contents/items/mailReceiptCountsButton/mailReceiptCountsButton.html',
            controller: MailReceiptCountsButton,
            bindings: {
                mail: '<'
            }
        });

    /* @ngInject */
    function MailReceiptCountsButton(MailReceiptItemUtil, MailReceiptRepository, MailListUtil, _) {
        var $ctrl = this;

        $ctrl.MailListUtil = MailListUtil;
        $ctrl.MailReceiptItemUtil = MailReceiptItemUtil;
        $ctrl.toggleRelatedMailListPerToMembers = toggleRelatedMailListPerToMembers;

        function toggleRelatedMailListPerToMembers(visible) {
            if (!_.isUndefined(visible)) {
                if (visible) {
                    MailReceiptRepository.fetchAndCache($ctrl.mail.id);
                } else {
                    MailReceiptRepository.removeById($ctrl.mail.id);
                }
            }
            return !!MailReceiptRepository.getContentById($ctrl.mail.id);
        }
    }

})();
