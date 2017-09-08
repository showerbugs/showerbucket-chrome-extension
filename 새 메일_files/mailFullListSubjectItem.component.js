(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailFullListSubjectItem', {
            templateUrl: 'modules/mail/contents/fullListItems/mailFullListSubjectItem/mailFullListSubjectItem.html',
            controller: MailFullListSubjectItem,
            bindings: {
                mail: '<'
            }
        });

    /* @ngInject */
    function MailFullListSubjectItem(MailListItemDisplayPartUtil, MailListStateMetaUtil, StateHelperUtil) {
        this.displayOptions = MailListItemDisplayPartUtil.getOptionsByStateName(StateHelperUtil.computeCurrentListStateName());
        this.displayTargets = MailListStateMetaUtil.getDisplayTargetInItem(StateHelperUtil.computeCurrentListStateName());
    }

})();
