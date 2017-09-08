(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .component('headerProfileBox', {
            templateUrl: 'modules/share/header/headerProfileBox/headerProfileBox.html',
            controller: HeaderProfileBox
        });

    /* @ngInject */
    function HeaderProfileBox(TENANT_MEMBER_ROLE, DomainRepository, MyInfo, PopupUtil, SettingModalFactory, _) {
        var $ctrl = this;

        this.loading = {
            domain: false
        };

        this.$onInit = function () {
            MyInfo.getDatas(MyInfo.KEYS.MY_INFO, MyInfo.KEYS.MY_ORG_LIST, MyInfo.KEYS.MY_ADMIN_ORG_LIST).then(function(datas) {
                $ctrl.myInfo = datas[0];
                $ctrl.organizations = datas[1];
                $ctrl.firstOrgName = _.get($ctrl.organizations, '[0].name', '');
                $ctrl.adminOrganizationList = datas[2];
            });
            DomainRepository.defaultDomainPromise().then(function (domain) {
                $ctrl.isNhnEntOrg = domain === 'nhnent.dooray.com';
                $ctrl.loading.domain = true;
            });
        };

        this.isAdminOrg = isAdminOrg;
        this.openSettingModal = openSettingModal;
        this.canShowQaPopup = canShowQaPopup;
        this.openQAPopup = openQAPopup;

        function isAdminOrg(orgId) {
            return _.find($ctrl.adminOrganizationList, {id: orgId});
        }

        function openSettingModal(openTarget) {
            SettingModalFactory.open(openTarget);
        }

        function canShowQaPopup() {
            return !!($ctrl.isNhnEntOrg && _.get($ctrl.myInfo, 'tenantMemberRole') !== TENANT_MEMBER_ROLE.GUEST.ROLE);
        }

        function openQAPopup() {
            PopupUtil.openTaskWritePopup('new', {
                type: 'new',
                projectCode: '(버그-개선)모든-플랫폼-솔루션',
                templateId: '1556397123916226747'
            });
        }
    }

})();
