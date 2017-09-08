(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .component('calendarList', {
            templateUrl: 'modules/calendar/navi/calendarList/calendarList.html',
            /* @ngInject */
            controller: function ($scope, CalendarRepository, CalendarAction, CalendarStatusAction, BrowserTitleChangeAction, CalendarSettingModal, CalendarTransportModal, MessageModalFactory, SettingModalFactory, PopupUtil, DOORAY_CALENDAR_COLORS, RootScopeEventBindHelper, gettextCatalog, _) {
                var $ctrl = this;
                $ctrl.$onInit = function () {
                    CalendarStatusAction.updateSelectCalendarId(null);
                    CalendarAction.fetchList();
                    $ctrl.calendarColors = DOORAY_CALENDAR_COLORS;
                    $ctrl.labelCheck = {};
                    BrowserTitleChangeAction.changeBrowserTitle(gettextCatalog.getString('캘린더'));
                };

                RootScopeEventBindHelper.withScope($scope).on(CalendarRepository.EVENTS.CHANGE_STATE, function(e, stateName){
                    if(stateName === 'calendars') {
                        filterList(CalendarRepository.get(stateName));
                    }

                    if(stateName === 'status') {
                        $ctrl.activeCalendarId = CalendarRepository.get('status.selectCalendarId');
                        $ctrl.isDoorayView = CalendarRepository.get('status.isDoorayView');
                        $ctrl.viewType = CalendarRepository.get('status.viewType');
                    }
                });

                function filterList(result) {
                    result = _.filter(result, 'listed');
                    $ctrl.privateCalendarList = _.reject(result, {'type': 'project'});
                    $ctrl.projectCalendarList = _.filter(result, {'type': 'project'});
                    $ctrl.allCalendarList = result;
                    setLabelCheck();
                }

                function setLabelCheck() {
                    $ctrl.labelCheck = {
                        all: isListAllCheck($ctrl.allCalendarList),
                        private: isListAllCheck($ctrl.privateCalendarList),
                        project: isListAllCheck($ctrl.projectCalendarList)
                    };

                    CalendarStatusAction.updateIsDoorayView(_.filter($ctrl.projectCalendarList, 'checked').length > 0);
                }

                function isListAllCheck(list) {
                    return _.filter(list, 'checked').length === list.length;
                }

                $ctrl.toggleCheckAllCalendar = function (calendars, target) {
                    CalendarStatusAction.updateSelectCalendarId(null);
                    _.forEach(calendars, function (calendar) {
                        if(calendar.checked !== $ctrl.labelCheck[target]) {
                            CalendarAction.setChecked(calendar.id, $ctrl.labelCheck[target]);
                            calendar.checked = $ctrl.labelCheck[target];
                        }
                    });
                };

                $ctrl.showAllCheckedCalendar = function () {
                    $ctrl.labelCheck.all = true;
                    $ctrl.toggleCheckAllCalendar($ctrl.allCalendarList, 'all');
                    BrowserTitleChangeAction.changeBrowserTitle(gettextCatalog.getString('캘린더'));
                };

                $ctrl.setActiveCalendar = function (calendar) {
                    CalendarStatusAction.updateSelectCalendarId(calendar.id);
                    BrowserTitleChangeAction.changeBrowserTitle(calendar.displayName);
                };

                $ctrl.checkCalendar = function (id, checked) {
                    CalendarAction.setChecked(id, checked);
                };

                $ctrl.openCreateCalendar = function () {
                    CalendarSettingModal.new();
                };

                $ctrl.updateCalendar = function (calendar) {
                    CalendarSettingModal.update(calendar);
                };

                $ctrl.removeCalendar = function (calendar) {
                    var message = gettextCatalog.getString("캘린더를 삭제하시겟습니까?");
                    MessageModalFactory.confirm(message).result.then(function () {
                        return CalendarAction.remove(calendar.id);
                    });
                };

                $ctrl.openCreateSchedule = function (calendarId) {
                    PopupUtil.openCalendarWritePopup('new', {
                        calendarId: calendarId,
                        autoFreebusy: true
                    });
                };

                $ctrl.openSettingModal = function () {
                    SettingModalFactory.open('myCalendar');
                };

                $ctrl.changeColor = function (id, color) {
                    CalendarAction.setColor(id, color);
                };

                $ctrl.importSchedule = function (calendar) {
                    CalendarTransportModal.import(calendar);
                };
            }
        });

})();
