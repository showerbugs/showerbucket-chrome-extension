(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .component('mailSignatureDetailSetting', {
            templateUrl: 'modules/setting/user/mailSignatureSetting/mailSignatureDetailSetting/mailSignatureDetailSetting.html',
            controller: MailSignatureDetailSetting,
            bindings: {
                signatures: '<',
                useIndex: '='
            }
        });

    /* @ngInject */
    function MailSignatureDetailSetting(MailSignatureModalFactory, MailSignatureRepository, MessageModalFactory, gettextCatalog) {
        var $ctrl = this;

        $ctrl.preview = preview;
        $ctrl.create = create;
        $ctrl.edit = edit;
        $ctrl.remove = remove;

        function preview(index) {
            MailSignatureModalFactory.preview($ctrl.signatures[index].content);
        }

        function create() {
            MailSignatureModalFactory.create();
        }

        function edit(index) {
            MailSignatureModalFactory.edit(index, $ctrl.signatures[index]);
        }

        function remove(index) {
            var msg = [
                gettextCatalog.getString('서명을 삭제하면 다시 복구할 수 없습니다.'),
                gettextCatalog.getString('삭제하시겠습니까?')
            ].join('<br/>');
            MessageModalFactory.confirm(msg, gettextCatalog.getString('서명 삭제'), {
                focusToCancel: true,
                confirmBtnLabel: gettextCatalog.getString('삭제')
            }).result.then(function () {
                    var info = MailSignatureRepository.getContent();
                    info.signatures = info.signatures.slice();
                    info.signatures.splice(index, 1);
                    info.useIndex = info.useIndex === index ? 0 : info.useIndex;
                    MailSignatureRepository.updateContent(info);
                });
        }

    }

})();
