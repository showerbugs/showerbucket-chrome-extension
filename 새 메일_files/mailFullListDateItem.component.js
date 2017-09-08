(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailFullListDateItem', {
            templateUrl: 'modules/mail/contents/fullListItems/mailFullListDateItem/mailFullListDateItem.html',
            controller: MailFullListDateItem,
            bindings: {
                mail: '<'
            }
        });

    /* @ngInject */
    function MailFullListDateItem(MailListUtil, MailListStateMetaUtil, StateHelperUtil) {
        var $ctrl = this;

        $ctrl.MailListUtil = MailListUtil;

        this.$onInit = function () {
            $ctrl.displayTargets = MailListStateMetaUtil.getDisplayTargetInItem(StateHelperUtil.computeCurrentListStateName());
        };

    }

})();
