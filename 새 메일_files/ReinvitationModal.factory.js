(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .factory('ReinvitationModal', ReinvitationModal)
        .component('reinvitationModal', {
            templateUrl: 'modules/setting/admin/org/member/ReinvitationModal/reinvitationModal.html',
            controller: ReinvitationModalComponent,
            bindings: {
                invitation: '<',
                close: '&',
                dismiss: '&'
            }
        });

    /* @ngInject */
    function ReinvitationModal($uibModal) {
        var modal;

        return {
            open: open
        };

        function open(invitation) {
            if (modal) {
                return modal;
            }

            modal = $uibModal.open({
                windowClass: 'setting-modal',
                backdrop: 'static', /*  this prevent user interaction with the background  */
                template: '<reinvitation-modal invitation="$ctrl.invitation" close="$ctrl.close()" dismiss="$ctrl.dismiss()"></reinvitation-modal>',
                controllerAs: '$ctrl',
                /* @ngInject */
                controller: function ($uibModalInstance) {
                    var $ctrl = this;
                    $ctrl.invitation = invitation;
                    $ctrl.close = close;
                    $ctrl.dismiss = dismiss;

                    function close() {
                        $uibModalInstance.close();
                    }

                    function dismiss() {
                        $uibModalInstance.dismiss();
                    }
                }
            });
            modal.result.finally(function () {
                modal = null;
            });
            return modal;
        }
    }

    /* @ngInject */
    function ReinvitationModalComponent(HelperLocaleUtil, InvitationBiz, MessageModalFactory, gettextCatalog) {
        var $ctrl = this;

        $ctrl.localeList = _.filter(HelperLocaleUtil.getLanguageList(), function (locale) {
            return locale.code !== 'zh_CN';
        });

        $ctrl.$onInit = function () {
            $ctrl.invitation.locale = $ctrl.invitation.locale === 'zh_CN' ? 'en_US' : $ctrl.invitation.locale;
        };

        $ctrl.submit = submit;

        function submit() {
            InvitationBiz.resend($ctrl.invitation.id, $ctrl.invitation.locale).then(function () {
                $ctrl.close();
                return MessageModalFactory.alert(gettextCatalog.getString('초대 메일을 재발송하였습니다.'), gettextCatalog.getString('초대 메일 재발송')).result;
            });
        }

    }

})();
