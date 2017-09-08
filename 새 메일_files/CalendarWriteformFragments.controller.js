(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .controller('CalendarWriteformEditorCtrl', CalendarWriteformEditorCtrl)
        .controller('CalendarWriteformFragmentsHeadCtrl', CalendarWriteformFragmentsHeadCtrl)
        .controller('CalendarWriteformFragmentsBodyCtrl', CalendarWriteformFragmentsBodyCtrl);

    /* @ngInject */
    function CalendarWriteformFragmentsHeadCtrl($scope, $stateParams, CalendarRecurrenceRuleModal, TagInputTaskHelper, TagInputMailHelper, CalendarPermissionUtil, CalendarRecurrenceRuleSummaryUtil, CalendarAlarmUtil, CheckDuplicatedUtil, WriteFormShare, HelperPromiseUtil, MyInfo, CalendarApiBiz, gettextCatalog, moment, _) {
        $scope.ui.calendars = [];
        $scope.ui.notification = {};
        $scope.ui.uiSelect = {};
        $scope.ui.uiSelect.searchUsers = [];
        $scope.autoFreebusy = WriteFormShare.submitForm().option('autoFreebusy');
        $scope.ALARM_LIST = CalendarAlarmUtil.ALARM_LIST;
        $scope.form.calendarId = $stateParams.calendarId;

        MyInfo.getMyInfo().then(function (result) {
            $scope.myInfo = result;
        });

        changeFreebusyRange();

        $scope.draftAction.setRemoveConfirmMsg(gettextCatalog.getString('임시 저장된 일정을 삭제하시겠습니까?'));
        $scope.openRecurrenceRuleModal = function () {
            var originRule = $scope.form.recurrenceRule;
            CalendarRecurrenceRuleModal.open($scope.form).result.then(function () {
            }, function () {
                $scope.form.recurrenceRule = originRule;
            });
        };

        $scope.deleteRecurrenceRule = function () {
            $scope.form.recurrenceRule = null;
        };

        $scope.initAlarmValue = function () {
            if($scope.mode.isUpdate) {
                $scope.ui.notification.enabled = $scope.form.alarms.length > 0;
                $scope.ui.notification.alarm = $scope.ui.notification.enabled ? $scope.form.alarms[0] : $scope.selectedCalendarItem.notification.alarms[0];
            } else {
                $scope.ui.notification.enabled = $scope.selectedCalendarItem.notification.enabled;
                $scope.ui.notification.alarm = $scope.selectedCalendarItem.notification.alarms[0];
                $scope.setAlarmFormValue();
            }
        };

        $scope.setAlarmValue = function () {
            if (!$scope.selectedCalendarItem) {
                return;
            }
            //알람 설정은 캘린더의 설정을 따라감
            $scope.ui.notification.enabled = $scope.selectedCalendarItem.notification.enabled;
            $scope.ui.notification.alarm = $scope.selectedCalendarItem.notification.alarms[0];
            $scope.setAlarmFormValue();
        };

        $scope.setAlarmFormValue = function () {
            $scope.form.alarms = $scope.ui.notification.enabled ? [{
                action: $scope.ui.notification.alarm.action,
                trigger: $scope.form.wholeDayFlag ? $scope.ui.notification.alarm.wholeDayTrigger : $scope.ui.notification.alarm.trigger
            }] : [];
        };


        //선택한 캘린더 ID 변경시 해당되는 캘린더 데이터를 선택
        $scope.$watch('form.calendarId', function (newVal) {
            $scope.selectedCalendarItem = findCalenderItemInList(newVal);
            $scope.setAlarmValue();
        });

        function changeFreebusyRange() {
            var range = moment($scope.form.endedAt).diff(moment($scope.form.startedAt), 'minutes');
            $scope.dateRange = {
                value: range,
                display: range + '분'
            };
        }

        $scope.changeDateTimePicker = function () {
            changeFreebusyRange();
        };

        $scope.isShowingFreebusy = function () {
            return $scope.selectedCalendarItem && $scope.selectedCalendarItem.type === 'private' &&
                $scope.ui.uiSelect.to.length > 0 && !$scope.form.wholeDayFlag && !$scope.ui.recurrence &&
                $scope.dateRange.value > 0 && $scope.dateRange.value < 1440;
        };

        var calendarListPromise;

        function asyncCalendarList() {
            if (HelperPromiseUtil.isResourcePending(calendarListPromise)) {
                return calendarListPromise;
            }
            calendarListPromise = CalendarApiBiz.fetchList().then(function (result) {
                //sort by type and name
                $scope.ui.calendars = _(result.contents()).filter('listed').filter(CalendarPermissionUtil.canCreateSchedule).value();
            });
            return calendarListPromise;
        }

        function assignAdjustDefaultCalendarId() {
            if (!CheckDuplicatedUtil.byString($scope.ui.calendars, 'id', $scope.form.calendarId) && $scope.ui.calendars.length > 0) {
                $scope.form.calendarId = _.find($scope.ui.calendars, function (calendar) {
                    return calendar.default;
                }).id;
            } else {
                $scope.selectedCalendarItem = findCalenderItemInList($scope.form.calendarId);
                $scope.initAlarmValue();
            }
        }

        function findCalenderItemInList(calendarId) {
            return _.find($scope.ui.calendars, {id: calendarId});
        }

        asyncCalendarList().then(assignAdjustDefaultCalendarId);

        _.assign($scope.ui.uiSelect, WriteFormShare.submitForm().option('users'));

        $scope.$watch(function () {
            return WriteFormShare.submitForm().option('users');
        }, function () {
            _.assign($scope.ui.uiSelect, WriteFormShare.submitForm().option('users'));
        });

        //form 형태로 되돌려줌
        $scope.$watchCollection('ui.uiSelect.to', function (newVal) {
            $scope.form.users.to = TagInputTaskHelper.toMemberOrGroupFromTaskDetailUser(newVal);
        });
        $scope.$watchCollection('ui.uiSelect.cc', function (newVal) {
            $scope.form.users.cc = TagInputTaskHelper.toMemberOrGroupFromTaskDetailUser(newVal);
        });

        $scope.$watch('form.startedAt', function (newVal) {
            if (canSyncRecurrenceStartedAt(newVal)) {
                $scope.form.recurrenceRule.startedAt = newVal;
            }
        });

        function canSyncRecurrenceStartedAt(startedAt) {
            return !$scope.form.updateType && !_.isEmpty($scope.form.recurrenceRule) && moment(startedAt).isAfter($scope.form.recurrenceRule.startedAt);
        }

        $scope.setTime = function (startedAt, endedAt) {
            $scope.form.startedAt = startedAt;
            $scope.form.endedAt = endedAt;
            if (!$scope.$$phase) {
                $scope.$digest();
            }
        };

        $scope.getRecurrenceSummary = function () {
            return CalendarRecurrenceRuleSummaryUtil.getSummary($scope.form.recurrenceRule);
        };

    }

    /* @ngInject */
    function CalendarWriteformEditorCtrl($scope/*, WriteFormShare*/) {
        $scope.options = {};
        //var form = WriteFormShare.submitForm().form();
    }

    /* @ngInject */
    function CalendarWriteformFragmentsBodyCtrl() {
    }

})();
