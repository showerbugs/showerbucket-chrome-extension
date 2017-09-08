(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailBodyContainer', {
            templateUrl: 'modules/mail/contents/mailBodyContainer/mailBodyContainer.html',
            controller: MailBodyContainer
        });

    /* @ngInject */
    function MailBodyContainer(MailDividerUtil,
                                MailResizeDividerRepository) {

        var $ctrl = this;

        this.$onInit = function () {
            _makeDivider();
        };

        this.$onDestroy = function () {
            MailResizeDividerRepository.removeDivider(MailResizeDividerRepository.DIVIDER_TYPES.NAVI);
        };

        function _makeDivider() {
            $ctrl.divider = MailDividerUtil.makeVerticalDivider(MailResizeDividerRepository.DIVIDER_TYPES.NAVI, 180);
            MailResizeDividerRepository.setDivider(MailResizeDividerRepository.DIVIDER_TYPES.NAVI, $ctrl.divider);
        }
    }

})();
