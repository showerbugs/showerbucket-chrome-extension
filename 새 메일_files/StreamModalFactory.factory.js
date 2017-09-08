(function () {

    'use strict';

    angular
        .module('doorayWebApp.stream')
        .factory('StreamModalFactory', StreamModalFactory);

    /* @ngInject */
    function StreamModalFactory($uibModal, $timeout) {
        var modalInstance = null;

        return {
            open: openModal,
            isOpen: isOpen
        };

        function openModal() {
            var element$;
            modalInstance =  $uibModal.open({
                controller: StreamModalCtrl,
                controllerAs: '$ctrl',
                template: '<stream-window modal-instance="::$ctrl.modalInstance"></stream-window>',
                windowClass: 'stream-modal',
                backdropClass: 'stream-backdrop'
            });

            modalInstance.opened.then(function () {
                // 이벤트가 닫히지 않아서 수정
                $timeout(function () {
                    element$ = angular.element('.stream-modal .modal-dialog');
                    element$.on('mouseup', function (event) {
                        if (angular.element(event.target).is('.modal-dialog')) {
                            angular.element('.stream-modal').click();
                            element$ && element$.off('mouseup');
                            element$ = null;
                        }
                    });
                }, 0, false);
            });

            modalInstance.result.finally(function () {
                modalInstance = null;
                element$ && element$.off('mouseup');
                element$ = null;
            });
            return modalInstance;
        }

        function isOpen() {
            return !!modalInstance;
        }
    }

    /* @ngInject */
    function StreamModalCtrl($uibModalInstance) {
        this.modalInstance = $uibModalInstance;
    }

})();
