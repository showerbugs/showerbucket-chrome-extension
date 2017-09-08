(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarTransportModal', CalendarTransportModal)
        .controller('CalendarTransportModalCtrl', CalendarTransportModalCtrl);

    /* @ngInject */
    function CalendarTransportModal($uibModal) {

        function openModal (calendar, tab) {
            return $uibModal.open({
                'templateUrl': 'modules/calendar/modals/CalendarTransportModal/calendarTransportModal.html',
                'windowClass': 'setting-modal dooray-setting-content calendar-transport-modal',
                'controller': 'CalendarTransportModalCtrl',
                'resolve': {
                    calendar: function () {
                        return calendar;
                    },
                    tab: function () {
                        return tab;
                    }
                }
            }).result;
        }

        return {
            'import': function (calendar) {
                return openModal(calendar, 'import');
            },
            'export': function (calendar) {
                return openModal(calendar, 'export');
            }
        };
    }

    /* @ngInject */
    function CalendarTransportModalCtrl($scope, calendar, $uibModalInstance, tab, CalendarImportIcsModal, CalendarImportFileBiz, CalendarScheduleAction) {

        var TAB_LIST = {
            'import': {
                index: 0,
                value: 'import'
            },
            'export': {
                index: 1,
                value: 'export'
            }
        };

        function init() {
            $scope.current = {};
            $scope.current.tab = TAB_LIST[tab];
            $scope.flowObject = CalendarImportFileBiz.getFlow(calendar.id);
        }

        init();

        $scope.import = function() {
            CalendarImportIcsModal.open($scope.flowObject, calendar.displayName).result.then(function(isSuccess){
                if(isSuccess) {
                    CalendarScheduleAction.fetchList();
                    $scope.close();
                }
            });
        };

        $scope.close = function () {
            $uibModalInstance.close();
        };

        $scope.changeTab = function (tab) {
            $scope.current.tab = TAB_LIST[tab];
        };

    }
})();
