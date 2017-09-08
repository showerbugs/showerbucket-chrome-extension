(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarPermissionUtil', CalendarPermissionUtil);

    /* @ngInject */
    function CalendarPermissionUtil(_) {

        function getMyPermission(calendar) {
            return _.get(calendar, 'permission', {});
        }

        function isOwner(calendar) {
            return _.get(calendar, 'permission', {}) === 'owner';
        }

        function equalCalendarOwnerWithSheduleOwner(calendar, shedule) {
            return calendar.ownerOrganizationMemberId === _.get(shedule, 'users.from.member.organizationMemberId');
        }

        //기본 캘린더는 수정 불가
        function canEditCalendar(calendar) {
            var myPermission = getMyPermission(calendar);

            return myPermission && _.includes(['owner', 'all'], myPermission) && calendar.type !== 'project';
        }

        function canDeleteCalendar(calendar) {
            return isOwner(calendar) &&
                !calendar.default && calendar.type !== 'project';
        }

        function canLeaveCalendar() {
            return !calendar.default && calendar.type !== 'project';
        }

        function canEnterCalendarSetting(calendar) {
            return calendar.type !== 'project';
        }

        function canCreateSchedule(calendar) {
            var myPermission = getMyPermission(calendar);
            return myPermission && calendar.type !== 'project' && _.includes(['owner', 'all', 'read_write'], myPermission);
        }

        function canEditSchedule(calendar, schedule) {
            var myPermission = getMyPermission(calendar);
            return (myPermission && calendar.type === 'shared' && _.includes(['owner', 'all', 'read_write'], myPermission))
                || (calendar.type === 'private' && equalCalendarOwnerWithSheduleOwner(calendar, schedule));
        }

        function canDeleteSchedule(calendar) {
            var myPermission = getMyPermission(calendar);
            return myPermission && calendar.type !== 'project' && _.includes(['owner', 'all', 'read_write'], myPermission);
        }

        return {
            isOwner: isOwner,
            canEditCalendar: canEditCalendar,
            canDeleteCalendar: canDeleteCalendar,
            canLeaveCalendar: canLeaveCalendar,
            canEnterCalendarSetting: canEnterCalendarSetting,
            canCreateSchedule: canCreateSchedule,
            canEditSchedule: canEditSchedule,
            canDeleteSchedule: canDeleteSchedule
        };
    }

})();
