(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarImportIcsModal', CalendarImportIcsModal)
        .controller('CalendarImportIcsModalCtrl', CalendarImportIcsModalCtrl);

    /* @ngInject */
    function CalendarImportIcsModal($uibModal) {
        var modalInstance = null;

        function openModal (flowObject, calendarName) {
            if(modalInstance) {
                return;
            }
            modalInstance = $uibModal.open({
                'templateUrl': 'modules/calendar/modals/CalendarImportIcsModal/calendarImportIcsModal.html',
                'windowClass': 'message-modal calendar-import-modal',
                'controller': 'CalendarImportIcsModalCtrl',
                'backdrop': 'static',
                'keyboard': 'false',
                'resolve': {
                    flowObject: function () {
                        return flowObject;
                    },
                    calendarName: function () {
                        return calendarName;
                    }
                }
            });

            modalInstance.result.finally(function(){
                modalInstance = null;
            });
            return modalInstance;
        }

        return {
            'open': function (flowObj, calendarName) {
                return openModal(flowObj, calendarName);
            }
        };
    }

    /* @ngInject */
    function CalendarImportIcsModalCtrl($scope, $uibModalInstance, calendarName, flowObject) {
        $scope.close = function () {
            $uibModalInstance.close($scope.isSuccess);
        };

        $scope.getFileProgressPercentage = function() {
            return parseInt($scope.flowObject.files[0].progress() * 100, 10);
        };

        function init() {
            $scope.isSuccess = false;
            $scope.flowObject = flowObject;
            $scope.flowObject.on('fileSuccess', onSuccess);
            $scope.flowObject.on('error', onError);
            $scope.calendarName = calendarName;
            //modal이 뜰때마다 다시 보내야하므로 retry method 사용
            $scope.flowObject.files[0].retry();
        }

        function onSuccess (file, responseText) {
            var response = angular.fromJson(responseText);

            if (!response.header.isSuccessful) {
                $scope.errorMsg = response.header.resultMessage;
                return;
            }
            $scope.isSuccess = true;
            $scope.icsFileLength = response.result.length;
        }

        function onError (message) {
            $scope.errorMsg = message;
        }

        $scope.$on('$destroy', function(){
            $scope.flowObject.off('fileSuccess');
            $scope.flowObject.off('error');
        });

        init();
    }
})();
