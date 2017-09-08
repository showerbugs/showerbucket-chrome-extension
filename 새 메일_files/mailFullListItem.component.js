(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailFullListItem', {
            templateUrl: 'modules/mail/contents/fullListItems/mailFullListItem/mailFullListItem.html',
            controller: MailFullListItem,
            bindings: {
                mail: '<',
                activeItemId: '<',
                colContainer: '<',
                grid: '<'
            }
        });

    /* @ngInject */
    function MailFullListItem($scope,
                               MAIL_STATE_NAMES,
                               MailItemPropertyUtil, MailListItemDragDropUtil, MailReceiptItemUtil, StateHelperUtil,
                               MailListItemCheckboxRepository) {
        var $ctrl = this;

        $ctrl.MAIL_STATE_NAMES = MAIL_STATE_NAMES;

        $ctrl.MailItemPropertyUtil = MailItemPropertyUtil;
        $ctrl.MailListItemDragDropUtil = MailListItemDragDropUtil;
        $ctrl.MailReceiptItemUtil = MailReceiptItemUtil;
        $ctrl.StateHelperUtil = StateHelperUtil;

        $scope.grid = $ctrl.grid;

        this.$onChanges = function (changes) {
            if (changes.activeItemId && changes.activeItemId.currentValue) {
                if ($ctrl.mail.id === $ctrl.activeItemId) {
                    MailItemPropertyUtil.getOrSetReadFlag($ctrl.mail, true);
                }
                MailListItemCheckboxRepository.toggleCheckItem($ctrl.mail.id, $ctrl.mail.id === $ctrl.activeItemId);
            }
        };
    }

})();
