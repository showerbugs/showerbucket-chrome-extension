(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .component('timeAndPlaceInView', {
            templateUrl: 'modules/calendar/view/components/timeAndPlaceInView/timeAndPlaceInView.html',
            controller: TimeAndPlaceInView,
            bindings: {
                item: '<',
                editForm: '<',
                showEditBtn: '@',
                onClickEdit: '&'
            }
        });

    /* @ngInject */
    function TimeAndPlaceInView(CalendarRecurrenceRuleSummaryUtil, CalendarAlarmUtil, DateConvertUtil, InlineEditFormBuilder, MessageModalFactory, gettextCatalog, _) {
        var $ctrl = this;
        $ctrl.editMode = false;
        $ctrl.uiVersion = 1;

        $ctrl.$onChanges = function (changes) {
            if (_.isEmpty($ctrl.item)) {
                return;
            }
            _setValue();

            if (!_.result(changes, 'item.isFirstChange')) {
                recompile();
            }
        };

        $ctrl.$onDestroy = function () {
            $ctrl.editForm = null;
        };

        $ctrl.show = show;
        $ctrl.convertDateTimeInView = convertDateTimeInView;
        $ctrl.getRecurrenceSummary = getRecurrenceSummary;
        $ctrl.getAlarmLabel = getAlarmLabel;

        function _setValue() {
            $ctrl.startedAt = $ctrl.item.startedAt;
            $ctrl.endedAt = $ctrl.item.endedAt;
            $ctrl.wholeDayFlag = $ctrl.item.wholeDayFlag;
            $ctrl.recurrenceType = $ctrl.item.recurrenceType;
            $ctrl.recurrenceRule = _.cloneDeep($ctrl.item.recurrenceRule);
            $ctrl.location = $ctrl.item.location;

            //mock TODO: API 연동 전 까지
            $ctrl.alarms = $ctrl.item.alarms || CalendarAlarmUtil.getDefaultAlarms();
        }

        function recompile() {
            $ctrl.uiVersion += 1;
        }

        function show() {
            $ctrl.editForm.show(_makeEditFormInstance()).then(function () {
                $ctrl.editMode = true;
                recompile();
            });
        }

        function convertDateTimeInView() {
            if ($ctrl.wholeDayFlag) {
                return DateConvertUtil.convertWholeDayRangeInView($ctrl.startedAt, $ctrl.endedAt);
            }

            return DateConvertUtil.convertDateTimeInView($ctrl.startedAt) + ' ~ ' +
                DateConvertUtil.convertDateTimeInView($ctrl.endedAt);
        }

        function getRecurrenceSummary() {
            if ($ctrl.recurrenceType === 'modified') {
                return gettextCatalog.getString('이 일정만 수정');
            }
            return CalendarRecurrenceRuleSummaryUtil.getSummary($ctrl.recurrenceRule);
        }

        function getAlarmLabel(trigger) {
            return CalendarAlarmUtil.getLabel(trigger);
        }

        function _makeEditFormInstance() {
            return new InlineEditFormBuilder('subject', gettextCatalog.getString('제목'))
                .withHasChanged(_hasChanged)
                .withCancel(_cancel)
                .withCreateSubmitData(_createSubmitData)
                .withFocus(recompile)
                .build();
        }

        function _hasChanged() {
            return $ctrl.subject !== $ctrl.item.subject;
        }

        function _cancel() {
            _setValue();
            $ctrl.editMode = false;
            recompile();
        }

        function _createSubmitData() {
            if ($ctrl.subject) {
                return {
                    subject: $ctrl.subject
                };
            }

            MessageModalFactory.alert(gettextCatalog.getString('제목을 입력해 주세요.')).result.then(function () {
                recompile();
            });
        }
    }

})();
