(function () {

    'use strict';

    angular
        .module('doorayWebApp.stream')
        .component('streamFragmentSchedules', {
            templateUrl: 'modules/stream/list/item/doorayStreamScheduleItem/streamFragmentScheuldes/streamFragmentScheuldes.html',
            controller: StreamFragmentSchedules,
            require: {
                streamScheduleCtrl: '^doorayStreamScheduleItem'
            },
            bindings: {
                'schedule': '<'
            }
        });

    /* @ngInject */
    function StreamFragmentSchedules($element, $q, DoorayLazyLoad, CalendarDataConverterUtil, moment) {
        var $ctrl = this,
            onDestroyHandler = angular.noop,
            dateMoment = moment($ctrl.schedule.startedAt);

        $ctrl.$onChanges = function () {
            if ($ctrl.schedule) {
                _init();
            }
        };
        $ctrl.$onDestroy = function () {
            onDestroyHandler();
        };

        function _init() {
            promiseSplitTimeCalendarInstance().then(function () {
                onDestroyHandler = function () {
                    $element.off('click');
                    $ctrl.calendar.destroy();
                    $ctrl.calendar = null;
                };
            });
        }

        //캘린더의 클릭이벤트보다 stream item의 ng click 이벤트가 먼저 발생해서 이벤트 막아줌
        $element.on('click', function (e) {
            e.stopPropagation();
        });

        function promiseSplitTimeCalendarInstance() {
            return DoorayLazyLoad.loadDoorayCalendar().then(function (DoorayCalendar) {
                if ($ctrl.calendar) {
                    return $q.when($ctrl.calendar);
                }

                $ctrl.calendar = DoorayCalendar.SplitTimeCalendar({
                    template: {
                        time: function (model) {
                            var scheduleTemplate = ['<strong>', moment(model.origin.starts).format('A hh:mm'), '</strong> ', model.title];
                            return scheduleTemplate.join('');
                        }
                    },
                    showTimeRange: 3,
                    renderStartDate: dateMoment.format(),
                    renderEndDate: moment($ctrl.schedule.endedAt).format()
                }, $element[0]);

                $ctrl.streamScheduleCtrl.fetchSchedulesByDay(dateMoment).then(function (result) {
                    //TODO: 스트림 캘린더 객체가 생성된 이후 API 요청 중 스트림 영역이 사라져 destroy 되었을때의 예외처리
                    if (!$ctrl.calendar) {
                        return;
                    }

                    $ctrl.calendar.createEvents(_(result.contents()).reject({id: $ctrl.schedule.id}).map(function (schedule) {
                        return CalendarDataConverterUtil.createCalendarModelFromApiModel(schedule);
                    }).value(), true);
                    $ctrl.calendar.render();
                });

                $ctrl.calendar.on('clickEvent', function (e) {
                    $ctrl.streamScheduleCtrl.openScheduleModal(e.jsEvent, e.model.id);
                });

                return $q.when($ctrl.calendar);
            });
        }
    }

})();
