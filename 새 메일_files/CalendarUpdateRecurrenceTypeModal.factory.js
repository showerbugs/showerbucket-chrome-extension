(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarUpdateRecurrenceTypeModal', CalendarUpdateRecurrenceTypeModal)
        .controller('CalendarUpdateRecurrenceTypeModalCtrl', CalendarUpdateRecurrenceTypeModalCtrl);

    /* @ngInject */
    function CalendarUpdateRecurrenceTypeModal($uibModal) {
        var $uibModalInstance;

        function getTemplate (action) {
            return action === 'update' ? 'modules/calendar/modals/CalendarUpdateRecurrenceTypeModal/calendarUpdateRecurrenceTypeModal.update.html':
                'modules/calendar/modals/CalendarUpdateRecurrenceTypeModal/calendarUpdateRecurrenceTypeModal.delete.html';
        }

        return {
            open: function (action) {
                if ($uibModalInstance) {
                    return $uibModalInstance;
                }

                action = action || 'update';
                $uibModalInstance = $uibModal.open({
                    'templateUrl': getTemplate(action),
                    'controller': 'CalendarUpdateRecurrenceTypeModalCtrl',
                    'windowClass': 'message-modal recurrence-update-type-modal',
                    'backdrop': 'static',
                    'resolve': {
                        action: function () {
                            return action || 'update';
                        }
                    }
                });
                $uibModalInstance.result.finally(function () {
                    $uibModalInstance = null;
                });
                return $uibModalInstance;
            }
        };
    }

    /* @ngInject */
    function CalendarUpdateRecurrenceTypeModalCtrl($scope, $uibModalInstance) {

        $scope.recurrenceUpdateType = 'this';
        $scope.ok = function () {
            $uibModalInstance.close($scope.recurrenceUpdateType);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

})();
