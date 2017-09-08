(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailCreatorInView', {
            templateUrl: 'modules/mail/view/bodyItems/mailCreatorInView/mailCreatorInView.html',
            controller: MailCreatorInView,
            bindings: {
                from: '<',
                classifyMap: '<',
                date: '<'
            }
        });

    /* @ngInject */
    function MailCreatorInView(DateConvertUtil) {
        var $ctrl = this;

        $ctrl.convertDateTimeInView = function (date) {
            return DateConvertUtil.convertDateTimeInView(date);
        };

    }

})();
