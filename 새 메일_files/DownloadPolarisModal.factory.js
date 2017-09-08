(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('DownloadPolarisModal', DownloadPolarisModal)
        .controller('DownloadPolarisModalCtrl', DownloadPolarisModalCtrl);

    /* @ngInject */
    function DownloadPolarisModal($uibModal) {
        var modalInstance = null;
        return {
            open: function () {
                if (modalInstance) {
                    return modalInstance;
                }
                modalInstance = $uibModal.open({
                    'templateUrl': 'modules/components/doorayPolarisLink/DownloadPolarisModal/donwloadPolarisModal.html',
                    'windowClass': 'message-modal download-polaris-modal',
                    'backdrop': 'static', /*  this prevent user interaction with the background  */
                    'controller': 'DownloadPolarisModalCtrl'
                }).result.finally(function () {
                        modalInstance = null;
                    });
                return modalInstance;
            }
        };
    }

    /* @ngInject */
    function DownloadPolarisModalCtrl($scope, $uibModalInstance) {
        $scope.close = function () {
            $uibModalInstance.close('close');
        };
    }

})();
