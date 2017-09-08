(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .component('mailSignatureSetting', {
            templateUrl: 'modules/setting/user/mailSignatureSetting/mailSignatureSetting.html',
            controller: MailSignatureSetting
        });

    /* @ngInject */
    function MailSignatureSetting($scope, HelperFormUtil, MailSignatureRepository, gettextCatalog) {
        var $ctrl = this;

        $ctrl.MailSignatureRepository = MailSignatureRepository;

        $ctrl.submit = submit;
        $ctrl.cancel = cancel;

        _init();

        function submit() {
            $ctrl.form.signatures = MailSignatureRepository.getContent().signatures;
            $ctrl.form.options.forward = $ctrl.form.options.reply;

            MailSignatureRepository.updateContent($ctrl.form).then(function () {
                $ctrl.resultMsg = gettextCatalog.getString('저장되었습니다.');
            });
        }

        function cancel() {
            _reset();
            $ctrl.resultMsg = gettextCatalog.getString('취소되었습니다.');
        }

        function _init() {
            $ctrl.FORM_NAME = 'signatureListForm';

            HelperFormUtil.bindService($scope, $ctrl.FORM_NAME);
            _reset();
        }

        function _reset() {
            MailSignatureRepository.fetchAndCache().then(function () {
                $ctrl.form = MailSignatureRepository.getContent();
                $scope.$applyAsync();
            });
        }

    }

})();
