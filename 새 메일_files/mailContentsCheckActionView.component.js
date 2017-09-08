(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailContentsCheckActionView', {
            templateUrl: 'modules/mail/view/mailContentsCheckActionView/mailContentsCheckActionView.html',
            controller: MailContentsCheckActionView
        });

    /* @ngInject */
    function MailContentsCheckActionView(MailListItemCheckboxRepository, MailItemsAction) {
        this.MailListItemCheckboxRepository = MailListItemCheckboxRepository;
        this.MailItemsAction = MailItemsAction;
    }

})();
