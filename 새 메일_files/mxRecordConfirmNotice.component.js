(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mxRecordConfirmNotice', {
            templateUrl: 'modules/mail/contents/mxRecordConfirmNotice/mxRecordConfirmNotice.html',
            controller: MxRecordConfirmNotice,
            bindings: {
                item: '<'
            }
        });

    /* @ngInject */
    function MxRecordConfirmNotice(MessageModalFactory, MailDomainBiz, HelperConfigUtil, gettextCatalog) {
        var $ctrl = this;
        $ctrl.notRegisteredMailDomain = HelperConfigUtil.checkMailDomain();
        $ctrl.confirmMXRecord = confirmMXRecord;

        this.$onInit = function () {
        };

        this.$onChanges = function () {
        };

        this.$onDestroy = function () {
        };


        function confirmMXRecord() {
            MessageModalFactory.confirm('<div><label translate>MX 레코드 (메일 서버 주소)</label>:<span>aspmx1.dooray.com</span></div> ' +
                '<div><label translate>우선순위</label>:<span>1</span></div>',
                gettextCatalog.getString('도메인 관리 사이트의 DNS 설정에서<br/> 아래 정보로 MX 레코드를 변경하셨나요?'), {
                    confirmBtnLabel: gettextCatalog.getString('MX 레코드 등록을 완료했습니다.')
                }, {
                    'windowClass': 'message-modal mx-record-confirm'
                }).result.then(function () {
                    MailDomainBiz.checkDomainExist($ctrl.notRegisteredMailDomain).then(function(result){
                       if(_.isObject(result.result())) {
                           successRegisterMxRecord();
                       } else {
                           failRegisterMxRecord();
                       }
                    });
                });
        }

        function successRegisterMxRecord() {
            MessageModalFactory.alert($ctrl.notRegisteredMailDomain + ' ' +  gettextCatalog.getString('메일주소를 사용할 수 있습니다.'), gettextCatalog.getString('MX 레코드 확인이 완료되었습니다.')).result.then(function(){
                $ctrl.notRegisteredMailDomain = null;
            });
        }

        function failRegisterMxRecord() {
            MessageModalFactory.alert(gettextCatalog.getString('도메인 관리 사이트에서 등록한 MX 레코드 정보를 반영하지 않았거나, MX 레코드 정보를 잘못 입력한 경우일 수 있습니다.'), gettextCatalog.getString('MX 레코드가 확인되지 않았습니다.'));
        }
    }

})();
