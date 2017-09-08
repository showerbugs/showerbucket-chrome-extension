(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarDataConverterUtil', CalendarDataConverterUtil);

    /* @ngInject */
    function CalendarDataConverterUtil(HelperConfigUtil, ColorUtil, moment, _) {

        function getCategory(category, wholeDayFlag) {
            if(category === 'general') {
                return wholeDayFlag? 'allday': 'time';
            } else if(category === 'post') { //요청 하기
                return 'task';
            }
            return category;
        }

        function getBgColor(color) {
            if(!color) {
                return '#000';
            }

            return ColorUtil.getRgbaFromHexColor(color, 0.2);
        }

        function getBorderColor(color) {
            if(!color) {
                return '#000';
            }

            return ColorUtil.getRgbaFromHexColor(color, 0.3);
        }

        function getCalenderDisplayName(calendar, orgMemberMap) {
            orgMemberMap = orgMemberMap || calendar._wrap.refMap.organizationMemberMap;
            if (calendar.type === 'shared') {
                return '[공유] ' + calendar.name;
            }
            else if (calendar.type === 'private') {
                // 멤버리스트에 owner가 나이고 멤버리스트가 하나이면 개인캘린더로 간주 (스팩변경가능성 있음)
                var owner = _.find(calendar.calendarMemberList, {permission: 'owner'}) || {},
                    isDefault = HelperConfigUtil.orgMemberId() === owner.member.organizationMemberId && calendar.calendarMemberList.length === 1;
                return isDefault ? calendar.name : ('[' + orgMemberMap(owner.member.organizationMemberId).name +'] ' + calendar.name);
            }

            return calendar.name;
        }

        return {
            getBgColor: getBgColor,
            getBorderColor: getBorderColor,
            getCalenderDisplayName: getCalenderDisplayName,
            getScheduleCategory: getCategory,
            setCalendarProp: function (calendar, orgMemberMap){
                calendar.bgColor = getBgColor(calendar.color);
                calendar.borderColor = getBorderColor(calendar.color);
                calendar.displayName = getCalenderDisplayName(calendar, orgMemberMap);
                return calendar;
            },
            createCalendarModelFromApiModel: function (apiModel, calendar) {
                var doorayEvent = {};

                doorayEvent.raw = apiModel;

                doorayEvent.id = apiModel.id;
                doorayEvent.calendarID = apiModel.calendarId;
                doorayEvent.title = apiModel.subject;
                doorayEvent.category = getCategory(apiModel.category, apiModel.wholeDayFlag);
                doorayEvent.dueDateClass = apiModel.dueDateClass;

                doorayEvent.isAllDay = apiModel.wholeDayFlag;
                doorayEvent.isPending = apiModel.isPending;

                if(calendar) {
                    doorayEvent.color = calendar.color;
                    doorayEvent.bgColor = calendar.bgColor;
                    doorayEvent.borderColor = calendar.borderColor;
                } else {
                    calendar = apiModel._wrap.refMap.calendarMap(apiModel.calendarId);
                    doorayEvent.color = calendar.color;
                    doorayEvent.bgColor = getBgColor(calendar.color);
                    doorayEvent.borderColor = calendar.color;
                }

                if (apiModel.category === 'general' || apiModel.category === 'milestone') {
                    // 일반 일정의 경우 startedAt, endedAt을 사용
                    doorayEvent.starts = apiModel.startedAt;
                    doorayEvent.ends = apiModel.endedAt;
                } else {
                    // 마일스톤, 업무 일정의 경우
                    // dueDate를 종료시간으로 쓰고,
                    doorayEvent.starts = moment(apiModel.dueDate).add(-30, 'minutes').format();
                    doorayEvent.ends = apiModel.startedAt;
                }
                return doorayEvent;
            }
        };
    }

})();
