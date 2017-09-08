(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .component('mailSignaturePreview', {
            templateUrl: 'modules/setting/user/mailSignatureSetting/MailSignatureModalFactory/mailSignaturePreview/mailSignaturePreview.html',
            controller: MailSignaturePreview,
            bindings: {
                dismiss: '&',
                content: '<'
            }
        });

    /* @ngInject */
    function MailSignaturePreview() {
    }

})();
