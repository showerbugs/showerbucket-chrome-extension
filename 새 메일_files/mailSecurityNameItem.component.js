(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailSecurityNameItem', {
            templateUrl: 'modules/mail/contents/items/mailSecurityNameItem/mailSecurityNameItem.html',
            controller: MailSecurityNameItem,
            bindings: {
                level: '<',
                shortname: '<'
            }
        });

    /* @ngInject */
    function MailSecurityNameItem(MailItemSecurityUtil) {
        this.MailItemSecurityUtil = MailItemSecurityUtil;
    }

})();
