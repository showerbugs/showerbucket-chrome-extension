(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailSearchVerticalListItem', {
            templateUrl: 'modules/mail/contents/mailSearchVerticalListItem/mailSearchVerticalListItem.html',
            controller: MailSearchVerticalListItem,
            bindings: {
                item: '<'
            }
        });

    /* @ngInject */
    function MailSearchVerticalListItem(ResponseWrapAppendHelper,
                                        MailListUtil, StateHelperUtil) {
        var $ctrl = this;
        $ctrl.MailListUtil = MailListUtil;
        $ctrl.StateHelperUtil = StateHelperUtil;


        $ctrl.$onInit = function () {
            //TODO 대외비를 위한 모킹 데이터 추가
            //_.assign($ctrl.item._wrap.refMap.mailMap($ctrl.item.id), {
            //    security: {
            //        level: ['normal', 'in_house', 'secret'][Math.floor(Math.random() * 3)],
            //        resend: false,
            //        autoDelete: true,
            //        retentionDays: 30
            //    }
            //    //DRAFT 상태일때만 전달되는 데이터
            //    //securityEditable: true,
            //    //individualSend: false
            //});
        };

        $ctrl.getMailWithRefMap = function (mail) {
            return mail ? ResponseWrapAppendHelper.assignWrap(mail, $ctrl.item._wrap.refMap) : undefined;
        };
    }

})();
