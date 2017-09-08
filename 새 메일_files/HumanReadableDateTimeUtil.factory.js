(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('HumanReadableDateTimeUtil', HumanReadableDateTimeUtil);

    /* @ngInject */
    function HumanReadableDateTimeUtil(gettextCatalog, moment, _) {
        var makeDateOption = function (name, id, start, end) {
            return {
                name: name,
                id: id,
                range: {
                    start: start,
                    end: end
                }
            };
        };

        var makeTimeOption = function (name, string, timestamp) {
           return {
               name: name,
               string: string,
               timestamp: timestamp
           };
        };

        return {
            DATE: {
                FUTURE: [
                    makeDateOption(gettextCatalog.getString('오늘까지'), 'untilToday', moment(0), moment().endOf('day')),
                    makeDateOption(gettextCatalog.getString('이번 주까지'), 'untilThisWeek', moment().startOf('day').add(1, 'days'), moment().endOf('day').day(7)),
                    makeDateOption(gettextCatalog.getString('다음 주까지'), 'untilNextWeek', moment().startOf('day').day(8), moment().endOf('day').day(14)),
                    makeDateOption(gettextCatalog.getString('이번 달까지'), 'untilThisMonth', moment().startOf('day').day(15), moment().endOf('month')),
                    makeDateOption(gettextCatalog.getString('다음 달까지'), 'untilNextMonth', moment().add(1, 'months').startOf('month'), moment().add(1, 'months').endOf('month')),
                    makeDateOption(gettextCatalog.getString('올해까지'), 'untilThisYear', moment().add(2, 'month').startOf('month'), moment().endOf('year')),
                    makeDateOption(gettextCatalog.getString('내년까지'), 'untilNextYear', moment().add(1, 'year').startOf('year'), moment().add(1, 'year').endOf('year'))
                ],
                PAST: [
                    makeDateOption(gettextCatalog.getString('오늘'), 'today', moment().startOf('day'), moment().endOf('day')),
                    makeDateOption(gettextCatalog.getString('이번 주'), 'thisWeek', moment().startOf('day').day(1), moment().startOf('day').subtract(1, 'seconds')),
                    makeDateOption(gettextCatalog.getString('지난 주'), 'lastWeek', moment().startOf('day').day(-6), moment().startOf('day').day(1).subtract(1, 'seconds')),
                    makeDateOption(gettextCatalog.getString('이번 달'), 'thisMonth', moment().startOf('month'), moment().startOf('day').day(-6).subtract(1, 'seconds')),
                    makeDateOption(gettextCatalog.getString('지난 달'), 'lastMonth', moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')),
                    makeDateOption(gettextCatalog.getString('올해'), 'thisYear', moment().startOf('year'), moment().subtract(1, 'month').startOf('month').subtract(1, 'seconds')),
                    makeDateOption(gettextCatalog.getString('작년'), 'lastYear', moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year'))
                ],
                FUTURE_BOUNDARY: makeDateOption('', 'end', null, moment().add(1, 'year').endOf('year')),
                PAST_BOUNDARY: makeDateOption('', 'start', moment().subtract(1, 'year').startOf('year'), null)
            },
            TIME: {
                LIST: [
                    makeTimeOption(gettextCatalog.getString('출근 전'), '08:59:00', moment.duration('08:59:59').valueOf()),
                    makeTimeOption(gettextCatalog.getString('점심 전'), '11:59:00', moment.duration('11:59:59').valueOf()),
                    makeTimeOption(gettextCatalog.getString('퇴근 전'), '23:59:00', moment.duration('23:59:59').valueOf())
                ],
                getOptions: function () {
                    return this.LIST;
                },
                getLastOption: function () {
                    return _.last(this.LIST);
                },
                findOptionMoreThenTimeStramp: function (timestamp) {
                    return _.find(this.LIST, function (option) {
                            return option.timestamp >= timestamp ;
                        }) || null;
                }
            }
        };
    }

})();
