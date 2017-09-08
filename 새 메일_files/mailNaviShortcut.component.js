(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailNaviShortcut', {
            templateUrl: 'modules/mail/navi/mailNaviShortcut/mailNaviShortcut.html',
            controller: MailNaviShortcut
        });

    /* @ngInject */
    function MailNaviShortcut(MAIL_STATE_NAMES, MailCountRepository, MailNaviUtil) {
        this.MAIL_STATE_NAMES = MAIL_STATE_NAMES;
        this.MailNaviUtil = MailNaviUtil;
        this.MailCountRepository = MailCountRepository;
    }

})();
