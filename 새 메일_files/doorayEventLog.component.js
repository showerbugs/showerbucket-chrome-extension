(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .component('doorayEventLog', {
            require: {
                list: '^doorayEventList'
            },
            /* @ngInject */
            templateUrl: function ($attrs) {
                return $attrs.templateUrl || 'modules/components/view/event/doorayEventLog/doorayEventLog.html';
            },
            controller: DoorayEventLog,
            bindings: {
                eventLog: '<',
                item: '<',
                templatePrefix: '@'
            }
        });

    /* @ngInject */
    function DoorayEventLog(ITEM_TYPE, SHARED_LINK_PARTS, CalendarScheduleModal, DateConvertUtil, TaskViewModalFactory, gettextCatalog, moment, _) {
        var self = this;
        this.templatePrefix = this.templatePrefix || 'modules/components/view/event/doorayEventLog/ui-templates/';

        var eventLogFragmentTplMap = {
            dueAt: this.templatePrefix + 'eventLogItemDueDateFragment.html',
            milestone: this.templatePrefix + 'eventLogItemMilestoneFragment.html',
            postUsers: this.templatePrefix + 'eventLogItemUsersFragment.html',
            scheduleUsers: this.templatePrefix + 'eventLogItemUsersFragment.html',
            usersWorkflow: this.templatePrefix + 'eventLogItemUserWorkflowFragment.html',
            subject: this.templatePrefix + 'eventLogItemSubjectFragment.html',
            file: this.templatePrefix + 'eventLogItemFilesFragment.html',
            move: this.templatePrefix + 'eventLogItemMoveTaskFragment.html',
            subPost: this.templatePrefix + 'eventLogItemSubPostFragment.html',
            parentPost: this.templatePrefix + 'eventLogItemParentTaskFragment.html',
            subPostWorkflow: this.templatePrefix + 'eventLogItemSubPostFragment.html',
            workflow: this.templatePrefix + 'eventLogItemTaskWorkflowFragment.html',
            sharedLink: this.templatePrefix + 'eventLogItemSharedLinkFragment.html',
            location: this.templatePrefix + 'eventLogItemLocationFragment.html',
            datetime: this.templatePrefix + 'eventLogItemDateTimeFragment.html', //켈린더 일정변경
            status: this.templatePrefix + 'eventLogItemStatusFragment.html', //켈린더 일정 수락
            myWorkflow: ''
        }, workfowNameMap = {
            registered: gettextCatalog.getString('등록'),
            working: gettextCatalog.getString('진행'),
            closed: gettextCatalog.getString('완료')
        };
        this.eventCreator = this.eventLog.creator.type === 'member' ?
            this.eventLog._wrap.refMap.organizationMemberMap(this.eventLog.creator.member.organizationMemberId) :
            this.eventLog.creator.emailUser;

        this.getEventLogTemplate = getEventLogTemplate;
        this.getUsersDisplayNameInEventLog = getUsersDisplayNameInEventLog;
        this.getWorkflowName = getWorkflowName;
        this.convertDisplayDueDate = convertDisplayDueDate;
        this.convertDateTime = convertDateTime;
        this.getPartsNames = getPartsNames;
        this.openItemModal = openItemModal;

        function getEventLogTemplate(eventLogName) {
            return eventLogFragmentTplMap[eventLogName];
        }

        function getUsersDisplayNameInEventLog(users) {
            return _.map(users, 'name').join(', ');
        }

        function getWorkflowName(workflow) {
            return workfowNameMap[workflow];
        }

        function convertDisplayDueDate(date, format) {
            return date ? moment(date).format(format) : gettextCatalog.getString('미정');
        }

        function convertDateTime(startedAt, endedAt, wholeDayFlag) {
            var diffDay = DateConvertUtil.getDiffDate(startedAt, endedAt);
            if (wholeDayFlag) {
                return DateConvertUtil.convertWholeDayRangeInView(startedAt, endedAt);
            }

            return DateConvertUtil.convertDateTimeInView(startedAt) + ' ~ ' +
                DateConvertUtil.convertDateTimeInView(endedAt) + (diffDay > 0 ? ' ' + gettextCatalog.getString('종일') : '');
        }

        function getPartsNames(parts) {
            return _(parts).map(function (part) {
                return SHARED_LINK_PARTS[part];
            }).join(', ');
        }

        function openItemModal() {
            switch (self.list.itemType) {
                case ITEM_TYPE.POST:
                    _openPostModal.apply(null, arguments);
                    return;
                case ITEM_TYPE.SCHEDULE:
                    _openScheduleModal.apply(null, argNames);
                    return;
            }
        }

        function _openPostModal(projectCode, postNumber) {
            TaskViewModalFactory.openModal(projectCode, postNumber);
        }

        function _openScheduleModal(scheduleId) {
            CalendarScheduleModal.open({raw: {id: scheduleId}, category: 'general'});
        }
    }

})();
