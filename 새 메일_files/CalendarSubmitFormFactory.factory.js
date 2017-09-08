(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .constant('CALENDAR_SUBMIT_FORM_TYPES', {
            CALENDAR: 'calendar'
        })
        .factory('CalendarSubmitFormFactory', CalendarSubmitFormFactory)
        .factory('CalendarSubmitFormBuilder', CalendarSubmitFormBuilder);


    /* @ngInject */
    function CalendarSubmitFormFactory(TagInputTaskHelper, CalendarSubmitFormBuilder, MIME_TYPE, _) {
        return {
            createNew: function (form, option) {
                return new CalendarSubmitFormBuilder().build(form, option);
            },

            createFromDetail: function (result) { //FOR Task Type From Draft Or Task Detail
                var content = result.contents(), refMap = result.refMap, self = this;
                var calendarSubmitForm = new CalendarSubmitFormBuilder().build();
                calendarSubmitForm.withForm({
                    id: _.get(content, 'id', null),
                    masterScheduleId:  _.get(content, 'masterScheduleId', null),
                    calendarId:  _.get(content, 'calendarId', null),
                    recurrenceId:  _.get(content, 'recurrenceId', null),
                    category:  _.get(content, 'category', null),
                    subject: _.get(content, 'subject', ''),
                    body: {
                        'mimeType': _.get(content, 'body.mimeType', MIME_TYPE.MARKDOWN.type),
                        'content': _.get(content, 'body.content', '')
                    },
                    users: {
                        to: TagInputTaskHelper.toMemberOrGroupFromTaskDetailUser(_.get(content, 'users.to', [])),
                        cc: TagInputTaskHelper.toMemberOrGroupFromTaskDetailUser(_.get(content, 'users.cc', []))
                    },
                    sequence: _.get(content, 'sequence', 0),
                    wholeDayFlag: _.get(content, 'wholeDayFlag', false),
                    location: _.get(content, 'location', ''),
                    fileIdList: _.get(content, 'fileIdList', []),
                    startedAt: self.convertDateTime(_.get(content, 'startedAt', null), _.get(content, 'wholeDayFlag', false)),
                    endedAt: self.convertDateTime(_.get(content, 'endedAt', null), _.get(content, 'wholeDayFlag', false)),
                    version: _.get(content, 'version', 0),
                    updateType: _.get(content, 'updateType', null),
                    recurrenceType: _.get(content, 'recurrenceType', 'none'),
                    recurrenceRule: _.get(content, 'recurrenceRule', null),
                    alarms: _.get(content, 'alarms', [])
                })
                    .withOption({
                        users: {
                            to: TagInputTaskHelper.toDetailMemberOrGroupFromDetailInfo(_.get(content, 'users.to', []), refMap),
                            cc: TagInputTaskHelper.toDetailMemberOrGroupFromDetailInfo(_.get(content, 'users.cc', []), refMap),
                            from: TagInputTaskHelper.toMemberOrGroupFromTaskDetailUser(_.get(content, 'users.from'))[0]
                        }
                    });

                return calendarSubmitForm;
            },

            convertDateTime: function (date, wholeDayFlag) {
                if(wholeDayFlag && date) {
                    return date.split('T')[0];
                }
                return date;
            }
        };
    }

    /* @ngInject */
    function CalendarSubmitFormBuilder(DefaultSubmitFormBuilder, CalendarSubmitFormApiBiz, DateConvertUtil, MIME_TYPE, SUBMIT_FORM_MODES, CALENDAR_SUBMIT_FORM_TYPES, moment, gettextCatalog, _) {


        var Constructor = angular.element.inherit(DefaultSubmitFormBuilder, {

            validateForm: function () {
                var form = this.form();
                var inValidDataList = [];

                if (_.isEmpty(form.calendarId)) {
                    inValidDataList.push({key: 'calendarId', msg: gettextCatalog.getString('캘린더를 선택해 주세요.')});
                }

                if (_.isEmpty(_.trim(form.subject))) {
                    inValidDataList.push({key: 'subject', msg: gettextCatalog.getString('제목을 입력해 주세요.')});
                }

                if (!DateConvertUtil.isValidDate(form.startedAt) || !DateConvertUtil.isValidDate(form.endedAt)) {
                    inValidDataList.push({key: 'date', msg: gettextCatalog.getString('입력한 날짜에 오류가 있습니다. 다시 입력해 주세요.')});
                }

                if ((!form.wholeDayFlag && moment(form.startedAt).isAfter(form.endedAt)) ||
                    (form.wholeDayFlag && moment(form.startedAt).isAfter(form.endedAt, 'day'))) {
                    inValidDataList.push({key: 'date', msg: gettextCatalog.getString('종료 시간은 시작 시간 이후로만 설정 할 수 있습니다.')});
                }

                if (!_.isEmpty(form.recurrenceRule) && moment(form.startedAt).isAfter(form.recurrenceRule.until)) {
                    inValidDataList.push({key: 'recurrenceDate', msg: gettextCatalog.getString('반복 일정의 날짜를 확인해 주세요.')});
                }

                return inValidDataList;
            },
            submit: function () {   //save task or update task
                var form = this.form();
                if (!this.form().id) {
                    return CalendarSubmitFormApiBiz.save(form);
                }
                return CalendarSubmitFormApiBiz.update(form);
            },

            resetFormModified: function () {
                return this.withForm(this.form());
            },

            isFormModified: function () {
                return !(
                    _.isEqual(this._originalForm.subject, this._form.subject) &&
                    _.isEqual(this._originalForm.body.content, this._form.body.content) &&
                    _.isEqual(this._originalForm.users.to, this._form.users.to) &&
                    _.isEqual(this._originalForm.users.cc, this._form.users.cc) &&
                    _.isEqual(this._originalForm.location, this._form.location)
                );
            }
        }, {
            getDefaultForm: function () {
                return {
                    id: null,
                    masterScheduleId: null,
                    calendarId: null,
                    recurrenceId: null,
                    category: 'general',
                    users: {
                        to: [],
                        cc: []
                    },
                    fileIdList: [],
                    subject: '',
                    body: {
                        mimeType: MIME_TYPE.MARKDOWN.type,
                        content: ''
                    },
                    sequence: 0,
                    wholeDayFlag: false,
                    location: '',
                    startedAt: DateConvertUtil.getNearestMinutes().format('YYYY-MM-DD HH:mm'),
                    endedAt: DateConvertUtil.getNearestMinutes().add(60, 'minutes').format('YYYY-MM-DD HH:mm'),
                    version: 0,
                    updateType: null,
                    recurrenceType: 'none',
                    recurrenceRule: null,
                    alarms: []
                };
            },
            getDefaultOption: function () {
                return {
                    type: CALENDAR_SUBMIT_FORM_TYPES.CALENDAR,
                    mode: SUBMIT_FORM_MODES.NEW,
                    users: {
                        to: [],
                        cc: [],
                        from: null
                    },
                    autoFreebusy: false
                };
            }
        });
        return Constructor;
    }

})();
