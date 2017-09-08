(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailToCcInView', {
            templateUrl: 'modules/mail/view/bodyItems/mailToCcInView/mailToCcInView.html',
            controller: MailToCcInView,
            bindings: {
                mail: '<',
                classifyMap: '<'
            }
        });

    /* @ngInject */
    function MailToCcInView() {
    }

})();
