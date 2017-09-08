(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailSecurityDescItem', {
            templateUrl: 'modules/mail/contents/items/mailSecurityDescItem/mailSecurityDescItem.html',
            controller: MailSecurityDescItem,
            bindings: {
                security: '<'
            }
        });

    /* @ngInject */
    function MailSecurityDescItem(MailItemSecurityUtil, moment, _) {
        var $ctrl = this;
        $ctrl.MailItemSecurityUtil = MailItemSecurityUtil;

        $ctrl.getRetentionDayFromDelete = getRetentionDayFromDelete;

        function getRetentionDayFromDelete() {
            return _.isNumber($ctrl.security.retentionDays) ? moment().add($ctrl.security.retentionDays, 'days').format('YYYY.MM.DD') : undefined;
        }
    }

})();
