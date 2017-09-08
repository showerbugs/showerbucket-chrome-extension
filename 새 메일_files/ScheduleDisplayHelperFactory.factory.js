(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('ScheduleDisplayHelperFactory', ScheduleDisplayHelperFactory);

    /* @ngInject */
    function ScheduleDisplayHelperFactory(STREAM_SHORT_CONTENT_LENGTH, DateConvertUtil, BodyContentsConvertUtil, displayUserFilter, simpleFormatDateFilter, HelperConfigUtil, _) {
        var AssignDisplayPropertiesBuilder = angular.element.inherit({
            __constructor: function (data) {
                this.data = data;
                this._wrap = _.get(data, '_wrap');
                // 본문에 NULL이 들어올 때의 예외처리
                if (_.get(data, 'body.content')) {
                    _.set(data, 'body.content', _.get(data, 'body.content', ''));
                }
            },
            withMemberGroupFilter: function (/*option*/) {
                var users = _.get(this.data, 'users'), refMap = this._wrap.refMap;
                var allUsers = _([]).concat(users.to, users.cc, users.from);

                _.forEach(allUsers.value(), function (user) {
                    if (user) {
                        displayUserFilter(user, refMap);
                    }
                });

                if (users.me) {
                    displayUserFilter(users.me, refMap);
                }

                return this;
            },
            withScheduleStatus: function () {
                var users = _.get(this.data, 'users');
                var scheduleMember = _([]).concat(users.to, users.cc).map('member').find({organizationMemberId: HelperConfigUtil.orgMemberId()});
                this.data._getOrSetProp('scheduleStatus', _.get(scheduleMember, 'status'));
                return this;
            },
            withCreatedAtSimpleFormat: function (isViewDateForm) {
                var createdAt = _.get(this.data, 'createdAt');
                this.data._getOrSetProp('createdAtSimpleFormat', isViewDateForm ?
                    DateConvertUtil.convertDateTimeInView(createdAt) :
                    simpleFormatDateFilter(createdAt));
                return this;
            },
            withShortContent: function (option) {
                var length = _.get(option, 'length', STREAM_SHORT_CONTENT_LENGTH),
                    propertyName = _.get(option, 'propertyName', 'body'),
                    body = _.get(this.data, propertyName);

                if (!body) {
                    return this;
                }
                var content = BodyContentsConvertUtil.convertToShortHtmlInTask(body, length);
                this.data._getOrSetProp('shortContents', body._hasMoreContent ? content + '...' : content);
                return this;
            },
            withCalendarName: function () {
                this.data.calendarName = this._wrap.refMap.calendarMap(_.get(this.data, 'calendarId')).name;
                return this;
            },
            withFetchedAt: function () {
                this.data._getOrSetProp('fetchedAt', DateConvertUtil.makeTimestamp());
                return this;
            },
            withResetFetchedAt: function () {
                this.data._resetFetchedAt = function () {
                    this._getOrSetProp('fetchedAt', DateConvertUtil.makeTimestamp());
                };
                return this;
            },
            build: function () {
                return this.data;
            }
        });

        return {
            AssignDisplayPropertiesBuilder: AssignDisplayPropertiesBuilder,
            assignDisplayPropertiesInView: function (data) {
                return new AssignDisplayPropertiesBuilder(data)
                    .withMemberGroupFilter()
                    .withCalendarName()
                    .withScheduleStatus()
                    .withFetchedAt()
                    .build();
            }
        };
    }

})();
