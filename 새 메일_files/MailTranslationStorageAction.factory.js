(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailTranslationStorageAction', MailTranslationStorageAction);

    /* @ngInject */
    function MailTranslationStorageAction(TranslationStorageBuilder) {
        return new TranslationStorageBuilder('mailTranslationInfo');
    }

})();
