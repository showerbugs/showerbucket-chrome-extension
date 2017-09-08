(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('WriteformModal', WriteformModal);

    /* @ngInject */
    function WriteformModal($uibModal) {
        var modalInstance;
        function createMessageModalInstance(modalOptions) {
            if (modalInstance) {
                modalInstance.close();
            }

            modalInstance = $uibModal.open(_.assign({
                windowClass: 'setting-modal dooray-setting-content writeform-modal',
                backdropClass: 'writeform-backdrop',
                controllerAs: '$ctrl'
            }, modalOptions));
            modalInstance.result.finally(function () {
                modalInstance = null;
            });
            return modalInstance;
        }

        return {
            openMail: function (type, mail) {
                return createMessageModalInstance({
                    /* @ngInject */
                    controller: function ($timeout, $uibModalInstance, gettextCatalog) {
                        this.mail = mail;
                        this.type = type;
                        this.closeWritformModal = closeWritformModal;
                        this.title = getDisplayTitle(type);

                        function closeWritformModal() {
                            $uibModalInstance.close('close modal');
                        }

                        function getDisplayTitle(type) {
                            switch (type) {
                                case 'reply' :
                                    return gettextCatalog.getString('답장');
                                case 'replyall' :
                                    return gettextCatalog.getString('전체 답장');
                                case 'forward' :
                                    return gettextCatalog.getString('전달');
                            }
                        }
                    },
                    templateUrl: 'modules/components/modals/WriteformModal/ui-templates/mailWriteform.html'
                });
            }
        };


    }

})();
