(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailSearchContentsVerticalList', {
            templateUrl: 'modules/mail/contents/mailSearchContentsVerticalList/mailSearchContentsVerticalList.html',
            controller: MailSearchContentsVerticalList,
            bindings: {
                loading: '<',
                itemList: '<'
            }
        });

    /* @ngInject */
    function MailSearchContentsVerticalList(StateHelperUtil) {
        var $ctrl = this;
        $ctrl.StateHelperUtil = StateHelperUtil;
    }

})();
