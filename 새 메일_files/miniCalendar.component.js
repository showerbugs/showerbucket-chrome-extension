(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .component('miniCalendar', {
            controller: MiniCalendarController
        });

    /* @ngInject */
    function MiniCalendarController($q, $scope, $element, CalendarStatusAction, CalendarRepository, RootScopeEventBindHelper, DoorayLazyLoad, CalendarApiBiz, HelperConfigUtil, _) {
        var $ctrl = this,
            miniCalInstance;

        $ctrl.$onInit = function () {
            promiseMiniCalendarInstance().then(function (minCalInstance) {
                RootScopeEventBindHelper.withScope($scope).on(CalendarRepository.EVENTS.CHANGE_STATE, function (e, stateName, changeStatus) {
                    if (stateName === 'schedules' && CalendarRepository.get('schedules').length > 0) {
                        _setMarkDate(minCalInstance);
                    }

                    if (stateName === 'status') {
                        if (_.includes(changeStatus, "startDate") || _.includes(changeStatus, "endDate")) {
                            minCalInstance.focusDateRange(CalendarRepository.get('status.startDate'), CalendarRepository.get('status.endDate'));
                        }

                        if (_.includes(changeStatus, "selectedDate")) {
                            minCalInstance.selectDate(CalendarRepository.get('status.selectedDate'));
                        }
                    }
                });
            });

        };

        function _setMarkDate(minCalInstance) {
            var renderDate = minCalInstance.options.renderMonth.getTime();
            CalendarApiBiz.getFreebusyTime({
                timeMin: moment(renderDate).startOf('month').format(),
                timeMax: moment(renderDate).endOf('month').format(),
                to: HelperConfigUtil.orgMemberId(),
                type: 'summary'
            }).then(function (result) {
                var busies = _.get(result.contents(), 'busy[0].busy', []);
                minCalInstance.markData(_.map(busies, function (busy) {
                    var tzoneTimeStamp = moment(busy).valueOf();
                    return {
                        start: new Date(tzoneTimeStamp),
                        end: new Date(tzoneTimeStamp)
                    };
                }));
            });
        }

        function promiseMiniCalendarInstance() {
            return DoorayLazyLoad.loadDoorayCalendar().then(function (DoorayCalendar) {
                if (miniCalInstance) {
                    return $q.when(miniCalInstance);
                }

                var $wrapper = angular.element('<div>').appendTo($element);
                miniCalInstance = new DoorayCalendar.MiniCalendar(null, $wrapper[0]);
                miniCalInstance.render();
                miniCalInstance.on('click', function (result) {
                    CalendarStatusAction.updateSelectedDate(moment(result.date).format('YYYY-MM-DD'));
                });

                miniCalInstance.on('change', function () {
                    _setMarkDate(miniCalInstance);
                });

                return $q.when(miniCalInstance);
            });
        }

    }

})();


