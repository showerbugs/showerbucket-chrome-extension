(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('NoticeModalFactory', NoticeModalFactory);

    /* @ngInject */
    function NoticeModalFactory($uibModal) {
        return {
            open: function () {
                return $uibModal.open({
                    'template': '<change-rule-notice close="$ctrl.close()"></change-rule-notice>',
                    'windowClass': 'dooray-modal setting-modal',
                    'backdrop': 'static', /*  this prevent user interaction with the background  */
                    'keyboard': false, /*  this prevent keydown with esc keycode  */
                    controllerAs: '$ctrl',
                    /* @ngInject */
                    'controller': function ($uibModalInstance) {
                        this.close = closeModal;

                        function closeModal() {
                            $uibModalInstance.close();
                        }
                    }
                });
            }
        };
    }
})();
