(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailVerticalListItem', {
            templateUrl: 'modules/mail/contents/verticalSplitItems/mailVerticalListItem/mailVerticalListItem.html',
            controller: MailVerticalListItem,
            bindings: {
                mail: '<',
                activeItemId: '<'
            }
        });

    /* @ngInject */
    function MailVerticalListItem(MAIL_STATE_NAMES,
                                   MailItemPropertyUtil, MailListUtil, MailListStateMetaUtil, MailListItemDisplayPartUtil, StateHelperUtil,
                                   MailListItemCheckboxRepository,
                                   MailItemsCheckboxRangeAction) {
        var $ctrl = this;

        $ctrl.MAIL_STATE_NAMES = MAIL_STATE_NAMES;
        $ctrl.MailListUtil = MailListUtil;
        $ctrl.StateHelperUtil = StateHelperUtil;
        $ctrl.MailListItemCheckboxRepository = MailListItemCheckboxRepository;
        $ctrl.MailItemsCheckboxRangeAction = MailItemsCheckboxRangeAction;

        this.$onInit = function () {
            $ctrl.actionButtonOpts = MailListStateMetaUtil.getActionButtonOpts(StateHelperUtil.computeCurrentListStateName());
            $ctrl.displayTargets = MailListStateMetaUtil.getDisplayTargetInItem(StateHelperUtil.computeCurrentListStateName());
            $ctrl.displayOptions = MailListItemDisplayPartUtil.getOptionsByStateName(StateHelperUtil.computeCurrentListStateName());
        };

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
