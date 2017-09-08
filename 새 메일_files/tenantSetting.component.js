(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .component('tenantSetting', {
            templateUrl: 'modules/setting/admin/tenant/tenantSetting/tenantSetting.html',
            controller: TenantSetting
        });

    /* @ngInject */
    function TenantSetting(DomainRepository, TenantRepository) {
        var $ctrl = this;
        $ctrl.TenantRepository = TenantRepository;

        DomainRepository.useNaverTranslatorPromise().then(function () {
            $ctrl.isLineisTenant = true;
        });
    }

})();
