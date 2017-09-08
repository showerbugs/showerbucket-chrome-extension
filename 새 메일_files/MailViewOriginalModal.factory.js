(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailViewOriginalModal', MailViewOriginalModal)
        .component('mailViewOriginal', {
            templateUrl: 'modules/mail/modals/MailViewOriginalModal/mailViewOriginal.html',
            controller: MailViewOriginal,
            bindings: {
                close: '&',
                mailId: '<'
            }
        });

    /* @ngInject */
    function MailViewOriginalModal($uibModal) {
        var modalInstance = null;
        return {
            open: open
        };

        // Public API Implements
        function open(mailId) {
            if (modalInstance) {
                return modalInstance;
            }

            modalInstance = $uibModal.open({
                template: '<mail-view-original close="$ctrl.close()" mail-id="$ctrl.mailId"></mail-view-original>',
                windowClass: 'view-original-modal',
                backdrop: 'static',
                controllerAs: '$ctrl',
                /* @ngInject */
                controller: function ($uibModalInstance) {
                    this.close = $uibModalInstance.close;
                    this.mailId = mailId;
                }
            });

            modalInstance.result.finally(function () {
                modalInstance = null;
            });
            return modalInstance;
        }
    }

    /* @ngInject */
    function MailViewOriginal(ApiConfigUtil, MailResource) {
        var $ctrl = this;

        this.$onInit = function () {
            _fetch($ctrl.mailId);
        };

        function _fetch(mailId) {
            $ctrl.downloadUrl = _makeUrl(mailId);
            MailResource.raw({mailId: mailId}).$promise.then(function (result) {
                $ctrl.originalText = result.raw;
            });
        }

        function _makeUrl(mailId) {
            return ApiConfigUtil.wasContext() + '/mails/' + mailId + '?type=raw';
        }
    }

})();
