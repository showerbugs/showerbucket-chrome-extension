(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .service('DateConvertUtil', DateConvertUtil);

    /* @ngInject */
    function DateConvertUtil(moment, _) {
        var TIMEZONE_OFFSET = -moment().utcOffset();
        var DEFAULT_DATE_FORMAT = 'YYYY-MM-DD', DEFAULT_TIME_FORMAT = 'HH:mm:ss',
            VIEW_DATE_TIME_FORMAT = 'MM.DD HH:mm',
            ONE_DAY_SECONDS = 24 * 60 * 60;

        return {
            parseDateTimeObjectFromNow: function (format) {
                return this.parseDateTimeObjectFromIso8601(moment().format(), format);
            },

            parseDateTimeObjectFromIso8601: function (iso8601String, format) {
                format = _.assign({date: DEFAULT_DATE_FORMAT, time: DEFAULT_TIME_FORMAT}, format);
                var mnDate = iso8601String ? moment(iso8601String) : null;
                if (mnDate && mnDate.isValid()) {
                    return {date: mnDate.format(format.date), time: mnDate.format(format.time)};
                }
                return {date: null, time: null};
            },

            convertIso8601FromDateTimeString: function (date, time) {
                time = time || moment(date).format(DEFAULT_TIME_FORMAT);
                return date ?
                    moment([moment(date).format(DEFAULT_DATE_FORMAT), time].join('T')).format() :
                    null;
            },

            makeDefaultIso8601String: function (value) {
                var momentObject = moment(value);
                return (momentObject.isValid()) ?
                    momentObject.format() :
                    null;
            },

            makeTimestamp: function () {
                return moment().valueOf();
            },

            isOverDate: function (date) {
                return date ? moment().startOf('day').isAfter(moment(date)) : false;
            },

            isValidDate: function (date) {
                return !_.isUndefined(date) && moment(date).isValid();
            },

            getTimezoneOffset: function () {
                return TIMEZONE_OFFSET;
            },

            getGMTOffset: function () {
                return moment().format('Z') + '[' + moment().tz() + ']';
            },

            convertDateToDays: function (date) {
                return Math.ceil(moment(date).add(-TIMEZONE_OFFSET / 60, 'hour').startOf('day').unix() / ONE_DAY_SECONDS);
            },

            convertDaysToDate: function (days) {
                return moment.unix(days * ONE_DAY_SECONDS).add(TIMEZONE_OFFSET / 60, 'hour');
            },

            convertDateTimeInView: function (date, format) {
                var dateObj = moment(date);
                format = format || VIEW_DATE_TIME_FORMAT;
                return dateObj.isBefore(moment().startOf('year')) ? dateObj.format('YYYY.' + format) : dateObj.format(format);
            },

            convertDateTimeRangeUTCFormat: function (start, end) {
                var startObj = moment(start),
                    endObj = moment(end),
                    startFormat = 'YYYY.MM.DD(dd) a HH:mm',
                    endFormat = (startObj.isSame(endObj, 'year') ? '' : 'YYYY.') + (startObj.isSame(endObj, 'day') ? '' : 'MM.DD(dd)') + 'a HH:mm';

                return startObj.format(startFormat) + ' - ' + endObj.format(endFormat) + '(GMT '+ this.getGMTOffset() + ')';
            },

            convertWholeDayInView: function (date) {
                date = _.isString(date) ? date : moment(date).format();
                return this.convertDateTimeInView(date.split('T')[0], 'MM.DD');
            },

            convertWholeDayRangeInView: function (start, end) {
                return this.getDiffDate(start, end) > 0 ?
                this.convertWholeDayInView(start) + ' ~ ' + this.convertWholeDayInView(end) : this.convertWholeDayInView(start);
            },

            getDiffDate: function (start, end, format) {
                return moment(end).diff(start, format || 'days');
            },

            getNearestMinutes: function (duration, date) { //default 30 minutes
                var timeMoment = moment(date) || moment(),
                    durationMoment =  moment.duration(duration || 30, "minutes");
                return moment(Math.ceil((timeMoment) / (durationMoment)) * (durationMoment));
            }
        };
    }

})();
