(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .factory('MailSignatureModalFactory', MailSignatureModalFactory);

    /* @ngInject */
    function MailSignatureModalFactory($uibModal) {
        return {
            create: openCreateModal,
            edit: openEditModal,
            preview: openPreviewModal
        };

        function openCreateModal() {
            $uibModal.open({
                /* @ngInject */
                controller: function ($scope, $uibModalInstance) {
                    this.close = $uibModalInstance.close;
                    this.dismiss = $uibModalInstance.dismiss;
                },
                windowClass: 'setting-modal signature-modal-position',
                controllerAs: '$ctrl',
                template: '<mail-signature-form mode="create" dismiss="$ctrl.dismiss()" close="$ctrl.close()"></mail-signature-form>',
                backdrop: 'static'
            });
        }

        function openEditModal(index, form) {
            $uibModal.open({
                /* @ngInject */
                controller: function ($scope, $uibModalInstance) {
                    this.close = $uibModalInstance.close;
                    this.dismiss = $uibModalInstance.dismiss;
                    this.index = index;
                    this.form = form;
                },
                controllerAs: '$ctrl',
                windowClass: 'setting-modal signature-modal-position',
                template: '<mail-signature-form mode="edit" dismiss="$ctrl.dismiss()" close="$ctrl.close()" ' +
                            'index="$ctrl.index" name="$ctrl.form.name" content="$ctrl.form.content"></mail-signature-form>',
                backdrop: 'static'
            });
        }

        function openPreviewModal(content) {
            $uibModal.open({
                /* @ngInject */
                controller: function ($scope, $uibModalInstance) {
                    this.dismiss = $uibModalInstance.dismiss;
                    this.content = content;
                },
                controllerAs: '$ctrl',
                windowClass: 'setting-modal',
                template: '<mail-signature-preview dismiss="$ctrl.dismiss()" content="$ctrl.content"></mail-signature-preview>',
                backdrop: 'static'
            });
        }
    }

})();
