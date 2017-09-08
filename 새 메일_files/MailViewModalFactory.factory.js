(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailViewModalFactory', MailViewModalFactory);

    /* @ngInject */
    function MailViewModalFactory($uibModal) {
        var openedFullViewModalInstance;

        return {
            openFullViewModal: openFullViewModal
        };

        function openFullViewModal() {
            if (openedFullViewModalInstance) {
                return;
            }

            openedFullViewModalInstance = $uibModal.open({
                template: '<mail-contents-view-modal layout $uib-modal-instance="::$ctrl.$uibModalInstance"></mail-contents-view-modal>',
                windowClass: 'full-view-modal modal-itemview',
                backdropClass: 'none-backdrop',
                controllerAs: '$ctrl',
                /* @ngInject */
                controller: function ($uibModalInstance) {
                    this.$uibModalInstance = $uibModalInstance;
                }
            });

            openedFullViewModalInstance.closed.then(function () {
                openedFullViewModalInstance = null;
            });
        }
    }

})();
