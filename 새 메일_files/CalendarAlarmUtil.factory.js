(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarAlarmUtil', CalendarAlarmUtil);

    /* @ngInject */
    function CalendarAlarmUtil(gettextCatalog, moment, _) {
        var ALARM_LIST = {
            time: [{
                label: gettextCatalog.getString('정시'), trigger: 'TRIGGER:-PT0S'
            }, {
                label: gettextCatalog.getString('5분 전'), trigger: 'TRIGGER:-PT5M'
            }, {
                label: gettextCatalog.getString('10분 전'), trigger: 'TRIGGER:-PT10M'
            }, {
                label: gettextCatalog.getString('15분 전'), trigger: 'TRIGGER:-PT15M'
            }, {
                label: gettextCatalog.getString('30분 전'), trigger: 'TRIGGER:-PT30M'
            }, {
                label: gettextCatalog.getString('1시간 전'), trigger: 'TRIGGER:-PT1H'
            }, {
                label: gettextCatalog.getString('2시간 전'), trigger: 'TRIGGER:-PT2H'
            }, {
                label: gettextCatalog.getString('3시간 전'), trigger: 'TRIGGER:-PT3H'
            }, {
                label: gettextCatalog.getString('12시간 전'), trigger: 'TRIGGER:-PT12H'
            }, {
                label: gettextCatalog.getString('1일(24시간) 전'), trigger: 'TRIGGER:-P1D'
            }, {
                label: gettextCatalog.getString('2일(48시간) 전'), trigger: 'TRIGGER:-P2D'
            }, {
                label: gettextCatalog.getString('1주(168시간) 전'), trigger: 'TRIGGER:-P1W'
            }],
            wholeDay: [{
                label: gettextCatalog.getString('당일 0시'), trigger: 'TRIGGER:-PT0S'
            }, {
                label: gettextCatalog.getString('당일 12시'), trigger: 'TRIGGER:PT12H'
            }, {
                label: gettextCatalog.getString('하루 전 12시'), trigger: 'TRIGGER:-PT12H'
            }, {
                label: gettextCatalog.getString('1주 전 12시'), trigger: 'TRIGGER:-P6WT12H'
            }]
        };

        function convertTriggerTime(date) {
            return 'TRIGGER;DATE-TIME: ' + moment(date).format('YYYYMMDD"T"HH:SS');
        }

        var NOTIFICATION_MOCK = [
            {
                "enabled": true,
                "alarms":[{
                    "action": "mail",               /* mail, messenger, .... */
                    "trigger": "TRIGGER:-PT10M",             /* rfc2445, duration, trigger */
                    "wholeDayTrigger": "TRIGGER:-PT0S",     /* rfc2445, duration, trigger */
                    "applyToNewEvents": true        /* default: true */
                }]
            }, {
                "enabled": true,
                "alarms":[{
                    "action": "mail",               /* mail, messenger, .... */
                    "trigger": "TRIGGER:-PT1H",             /* rfc2445, duration, trigger */
                    "wholeDayTrigger": "TRIGGER:-PT12H",     /* rfc2445, duration, trigger */
                    "applyToNewEvents": true        /* default: true */
                }]
            }, {
                "enabled": true,
                "alarms":[{
                    "action": "mail",               /* mail, messenger, .... */
                    "trigger": "TRIGGER:-P1D",             /* rfc2445, duration, trigger */
                    "wholeDayTrigger": "TRIGGER:-P6WT12H",     /* rfc2445, duration, trigger */
                    "applyToNewEvents": true        /* default: true */
                }]
            }
        ];

        return {
            ALARM_LIST: ALARM_LIST,
            getDefaultAlarms: function() {
                return [{
                    "action": "mail",
                    "trigger": "TRIGGER:-PT10M",
                    "wholeDayTrigger": "TRIGGER:-PT12H",
                    "applyToNewEvents": true
                }];
            },
            getLabel: function(trigger) {
                var alarms = _(ALARM_LIST.time).concat(ALARM_LIST.wholeDay).filter({trigger: trigger}).value();
                return alarms.length > 0 ? alarms[0].label : '';
            },
            convertTriggerTime: convertTriggerTime,
            //api 연동전까지 테스트용
            getMock: function(){
                return NOTIFICATION_MOCK[_.random(0, 2)];
            }
        };
    }

})();
