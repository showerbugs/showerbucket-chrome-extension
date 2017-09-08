(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .component('tenantTranslator', {
            templateUrl: 'modules/setting/admin/tenant/translator/tenantTranslator.html',
            controller: TenantTranslator
        });

    /* @ngInject */
    function TenantTranslator($timeout, TranslatorRepository) {
        var $ctrl = this;

        $ctrl.submit = submit;
        $ctrl.cancel = cancel;

        this.$onInit = function () {
            $ctrl.FORM_NAME = 'TRANSLATOR_FORM';
            $ctrl.isShowingResultMsg = false;
            $ctrl.translator = 'dooray';
            _fetchTranslator();
        };

        function submit() {
            TranslatorRepository.update({translator: $ctrl.translator}).then(function () {
                $ctrl.isShowingResultMsg = true;
                $timeout(function () {
                    $ctrl.isShowingResultMsg = false;
                }, 2000);
            });
        }

        function cancel() {
            $ctrl.translator = TranslatorRepository.getModel().value.translator;
        }

        function _fetchTranslator() {
            TranslatorRepository.fetchAndCache().then(function () {
                $ctrl.translator = TranslatorRepository.getModel().value.translator;
            });
        }


    }

})();
