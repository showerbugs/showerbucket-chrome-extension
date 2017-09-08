(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailFullListToItem', {
            templateUrl: 'modules/mail/contents/fullListItems/mailFullListToItem/mailFullListToItem.html',
            controller: MailFullListToItem,
            bindings: {
                mail: '<'
            }
        });

    /* @ngInject */
    function MailFullListToItem(MailListUtil) {
        this.MailListUtil = MailListUtil;
    }

})();
