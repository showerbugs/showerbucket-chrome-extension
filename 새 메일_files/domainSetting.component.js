(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .component('domainSetting', {
            templateUrl: 'modules/setting/admin/tenant/domainSetting/domainSetting.html',
            controller: DomainSettingCtrl
        })
        .component('domainSettingMxRecordNotice', {
            templateUrl: 'modules/setting/admin/tenant/domainSetting/domainSettingMXRecordNotice.html',
            controller: DomainSettingMXRecordNoticeCtrl
        });

    /* @ngInject */
    function DomainSettingCtrl(MessageModalFactory, DomainRepository, MailDomainBiz, gettextCatalog) {
        var $ctrl = this;

        $ctrl.openCreateMXRecordNotice = openCreateMXRecordNotice;

        this.$onInit = function () {
            $ctrl.isShowingResultMsg = false;
            DomainRepository.getOrFetch().then(function(result){
                $ctrl.domains = _.map(result, 'domain');
            });

            MailDomainBiz.fetchList().then(function(result){
                $ctrl.mailDomains = _.map(result.contents(), 'domain');
            });
        };

        function openCreateMXRecordNotice(){
            MessageModalFactory.template('', gettextCatalog.getString('자체 도메인 추가'), 'modules/setting/admin/tenant/domainSetting/domainSettingMXRecordNoticeModal.html');
        }

    }

    /* @ngInject */
    function DomainSettingMXRecordNoticeCtrl(PopupUtil) {
        var $ctrl = this;

        $ctrl.openMailWriteForm = function () {
            PopupUtil.openMailWritePopup('new', {to: 'dooray@nhnent.com'});
        };
    }

})();
