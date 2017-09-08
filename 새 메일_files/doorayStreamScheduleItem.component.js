(function () {

    'use strict';

    angular
        .module('doorayWebApp.stream')
        .component('doorayStreamScheduleItem', {
            templateUrl: 'modules/stream/list/item/doorayStreamScheduleItem/doorayStreamScheduleItem.html',
            controller: DoorayStreamScheduleItem,
            bindings: {
                streamItem: '<',
                editTarget: '<',
                viewScheduleContent: '&',
                toggleWriteform: '&'
            }
        });

    /* @ngInject */
    function DoorayStreamScheduleItem($element, $timeout, ITEM_TYPE, CalendarRecurrenceRuleSummaryUtil, CalendarScheduleApiBiz, CommonStreamUtil, DateConvertUtil, CalendarScheduleModal, HelperPromiseUtil, ItemSyncService, ScheduleDisplayHelperFactory, gettextCatalog) {
        var $ctrl = this,
            setStatusPromise = null,
            statusMsgMap = {
                accepted: gettextCatalog.getString('일정을 수락했습니다.'),
                tentative: gettextCatalog.getString('일정을 미정으로 지정합니다.'),
                declined: gettextCatalog.getString('일정을 거절했습니다.')
            };

        $ctrl.ITEM_TYPE = ITEM_TYPE;
        $ctrl.isRead = CommonStreamUtil.makeIsReadFunc($ctrl.streamItem);
        $ctrl.viewContent = viewContent;
        $ctrl.openCommentWriteform = openCommentWriteform;
        $ctrl.changeStatus = changeStatus;
        $ctrl.getRecurrenceSummary = getRecurrenceSummary;
        $ctrl.openScheduleModal = openScheduleModal;
        $ctrl.fetchSchedulesByDay = fetchSchedulesByDay;
        $ctrl.applyCommentWrapper = applyCommentWrapper;
        $ctrl.convertDateTimeInView = convertDateTimeInView;
        $ctrl.saveMinHeight = saveMinHeight;

        _init();

        function applyCommentWrapper(event) {
            CommonStreamUtil.applyCommentWrapper(event, ITEM_TYPE.SCHEDULE);
        }

        function convertDateTimeInView(schedule) {
            if (schedule.wholeDayFlag) {
                return DateConvertUtil.convertWholeDayRangeInView(schedule.startedAt, schedule.endedAt);
            }

            return DateConvertUtil.convertDateTimeInView(schedule.startedAt) + ' ~ ' +
                DateConvertUtil.convertDateTimeInView(schedule.endedAt);
        }

        function saveMinHeight() {
            $timeout(function () {
                $ctrl.streamItem._getOrSetProp('cardMinHeight', $element.find('.schedule-card').height());
            }, 500, false);
        }

        function openCommentWriteform(schedule) {
            var editTarget = {
                type: ITEM_TYPE.SCHEDULE,
                id: schedule.id
            };
            $ctrl.toggleWriteform({editTarget: editTarget});
        }

        function viewContent(eventId, type) {
            $ctrl.viewScheduleContent({streamItem: $ctrl.streamItem, focusTarget: {eventId: eventId, type: type}});
        }

        function changeStatus(status) {
            if (HelperPromiseUtil.isResourcePending(setStatusPromise) || $ctrl.schedule._getOrSetProp('scheduleStatus') === status) {
                return;
            }
            $ctrl.schedule._getOrSetProp('statusMsg', statusMsgMap[status]);
            ItemSyncService.syncItemUsingCallback($ctrl.schedule.id, ITEM_TYPE.SCHEDULE, function (schedule) {
                schedule._getOrSetProp('scheduleStatus', status);
            });
            setStatusPromise = CalendarScheduleApiBiz.setStatus($ctrl.schedule.id, status).catch(function () {
                ItemSyncService.syncItemUsingCallback($ctrl.schedule.id, ITEM_TYPE.SCHEDULE, function (schedule) {
                    schedule._getOrSetProp('scheduleStatus', status);
                });
            });
        }

        function getRecurrenceSummary() {
            if ($ctrl.schedule.recurrenceType === 'modified') {
                return gettextCatalog.getString('일정 편집');
            }
            return CalendarRecurrenceRuleSummaryUtil.getSummary($ctrl.schedule.recurrenceRule);
        }

        function _init() {
            _setSchedule();
            $ctrl.statusMsg = $ctrl.schedule._getOrSetProp('statusMsg');
            $ctrl.schedule._getOrSetProp('statusMsg', '');
            $ctrl.fromMember = $ctrl.schedule.users.from;
        }

        function _setSchedule() {
            $ctrl.schedule = $ctrl.streamItem._wrap.refMap.scheduleMap($ctrl.streamItem.schedule.id);
            // sync 후 데이터 정합성 맞추기
            var streamItem = $ctrl.streamItem,
                status = $ctrl.schedule._getOrSetProp('scheduleStatus');
            $ctrl.eventList = CommonStreamUtil.applyEventDetail(streamItem);
            ScheduleDisplayHelperFactory.assignDisplayPropertiesInView($ctrl.schedule);
            $ctrl.scheduleRange = moment($ctrl.schedule.endedAt).diff($ctrl.schedule.startedAt, 'hours');
            if (status) {
                $ctrl.schedule._getOrSetProp('scheduleStatus', status);
            }
        }

        function openScheduleModal($evt, scheduleId) {
            $evt.stopPropagation();
            CalendarScheduleModal.open({raw: {id: scheduleId}, category: 'general'});
        }

        function fetchSchedulesByDay(dateMoment) {
            var param = {
                timeMin: dateMoment.startOf('day').format(),
                timeMax: dateMoment.endOf('day').format(),
                category: 'general'
            };
            return CalendarScheduleApiBiz.fetchList(param);
        }
    }

})();
