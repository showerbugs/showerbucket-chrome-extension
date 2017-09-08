(function () {

    'use strict';

    angular
        .module('doorayWebApp.stream')
        .component('streamAllDaySchedules', {
            templateUrl: 'modules/stream/list/item/doorayStreamScheduleItem/streamAllDaySchedules/streamAllDaySchedules.html',
            controller: StreamAllDaySchedules,
            require: {
                streamScheduleCtrl: '^doorayStreamScheduleItem'
            },
            bindings: {
                'date': '<',
                'scheduleId': '<',
                'onLoad': '&'
            }
        });

    /* @ngInject */
    function StreamAllDaySchedules(CalendarDataConverterUtil, moment) {
        var self = this;
        var dateMoment = moment(self.date);

        self.TIME_FORMAT = 'HH:mm';
        self.DATE_FORMAT = 'YYYY. MM. DD';

        self.isEqualToDate = isEqualToDate;
        self.$onInit = _init;
        self.convertColor = CalendarDataConverterUtil.getBgColor;

        function isEqualToDate(date) {
            return dateMoment.isSame(date, 'day');
        }

        function _init() {
            var mnDate = moment(self.date);
            self.currentDate = (mnDate && mnDate.isValid()) ? mnDate.format(self.DATE_FORMAT) : null;
            self.streamScheduleCtrl.fetchSchedulesByDay(dateMoment).then(function(result){
                self.schedules = _.sortBy(result.contents(), 'startedAt');
                self.onLoad();
            });
        }
    }

})();
