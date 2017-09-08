(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarRecurrenceRuleSummaryUtil', CalendarRecurrenceRuleSummaryUtil);

    /* @ngInject */
    function CalendarRecurrenceRuleSummaryUtil(moment, gettextCatalog, _) {
        var items = {
            frequency: [
                {label: gettextCatalog.getString('일'), value: 'daily'},
                {label: gettextCatalog.getString('주'), value: 'weekly'},
                {label: gettextCatalog.getString('개월'), value: 'monthly'},
                {label: gettextCatalog.getString('년'), value: 'yearly'}
            ],
            weekly: [
                {label: gettextCatalog.getString('일'), value: 'SU'},
                {label: gettextCatalog.getString('월'), value: 'MO'},
                {label: gettextCatalog.getString('화'), value: 'TU'},
                {label: gettextCatalog.getString('수'), value: 'WE'},
                {label: gettextCatalog.getString('목'), value: 'TH'},
                {label: gettextCatalog.getString('금'), value: 'FR'},
                {label: gettextCatalog.getString('토'), value: 'SA'}
            ]
        };

        return {
            items: items,
            getSummary: getSummary,
            getLabel: getLabel,
            countWeekdayInMonth: countWeekdayInMonth
        };

        function getSummary(recurrenceRule) {
            var formattedStartedAtDate = moment(recurrenceRule.startedAt), summaryBuffer = [];
            summaryBuffer.push(formattedStartedAtDate.isValid() ? formattedStartedAtDate.format('YYYY.MM.DD') + ' ' + gettextCatalog.getString('부터') : '');
            summaryBuffer.push(recurrenceRule.until && moment(recurrenceRule.until).isValid() ? moment(recurrenceRule.until).format('YYYY.MM.DD') + ' ' + gettextCatalog.getString('까지') : '');
            summaryBuffer.push(getIntervalSummary(recurrenceRule));
            summaryBuffer.push(getFrequencySummary(recurrenceRule));

            return summaryBuffer.join(' ');
        }

        function getIntervalSummary(recurrenceRule) {
            var frequencyItem = _.find(items.frequency, {'value': recurrenceRule.frequency});
            return recurrenceRule.interval + (frequencyItem ? frequencyItem.label + gettextCatalog.getString('마다') : '');
        }

        function getFrequencySummary(recurrenceRule) {
            var frequency = recurrenceRule.frequency;
            if (frequency === 'weekly' && recurrenceRule.byday) {
                return _.map(recurrenceRule.byday.split(','), function (day) {
                    return _.find(items.weekly, {value: day}).label;
                }).join(',');
            } else if (frequency === 'monthly' || frequency === 'yearly') {
                return getLabel(recurrenceRule.bymonthday ? 'dayOfMonth' : 'dayOfWeek', frequency, recurrenceRule.startedAt);
            }
            return '';
        }

        function getLabel(value, frequency, startedAt) {
            var label = '';

            if (frequency === 'yearly') {
                label += moment(startedAt).get('month') + 1 + gettextCatalog.getString('월') + ' ';
            }
            if (value === 'dayOfMonth') {
                label += moment(startedAt).get('date') + gettextCatalog.getString('일');
            } else if (value === 'dayOfWeek') {
                label += countWeekdayInMonth(startedAt) + gettextCatalog.getString('번째') + ' ' + moment(startedAt).format('dddd');
            }
            return label;
        }

        function countWeekdayInMonth(date) { //달 기준으로 ex) 3번째 화요일
            var m = moment(date),
                weekDay = m.day(),//월 = 1, 화 = 2...
                yearDay = m.dayOfYear(), //연 단위로 2월 1일 = 32
                count;

            m.startOf('month');
            while (m.dayOfYear() <= yearDay) {
                if (m.day() === weekDay) {
                    break;
                }
                m.add(1, 'days');
            }
            count = (yearDay - m.dayOfYear()) / 7 + 1;
            return count;
        }
    }

})();
