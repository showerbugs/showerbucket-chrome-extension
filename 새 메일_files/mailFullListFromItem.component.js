(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailFullListFromItem', {
            templateUrl: 'modules/mail/contents/fullListItems/mailFullListFromItem/mailFullListFromItem.html',
            controller: MailFullListFromItem,
            bindings: {
                mail: '<'
            }
        });

    /* @ngInject */
    function MailFullListFromItem(MailListUtil) {
        this.MailListUtil = MailListUtil;
    }

})();
