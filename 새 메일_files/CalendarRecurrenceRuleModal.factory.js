(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarRecurrenceRuleModal', CalendarRecurrenceRuleModal)
        .factory('CalendarRecurrenceRuleModalConverter', CalendarRecurrenceRuleModalConverter)
        .controller('CalendarRecurrenceRuleModalCtrl', CalendarRecurrenceRuleModalCtrl);


    /* @ngInject */
    function CalendarRecurrenceRuleModal($uibModal) {
        var modalInstance;

        return {
            open: function (form) {
                if (modalInstance) {
                    return;
                }

                modalInstance = $uibModal.open({
                    templateUrl: 'modules/calendar/modals/CalendarRecurrenceRuleModal/calendarRecurrenceRuleModalTpl.html',
                    controller: 'CalendarRecurrenceRuleModalCtrl',
                    windowClass: 'calendar-modal calendar-recurrence-rule-modal',
                    backdrop: 'static',
                    resolve: {
                        form: function () {
                            return form;
                        }
                    }
                });

                modalInstance.result.finally(function () {
                    modalInstance = null;
                });

                return modalInstance;
            }
        };
    }

    function CalendarRecurrenceRuleModalConverter(CalendarRecurrenceRuleSummaryUtil, moment, _) {

        return {
            convertToParam: convertModelToRecurrenceRuleParam,
            convertToModel: convertRecurrenceRuleParamToModel
        };

        //model Data -> API Data
        function convertModelToRecurrenceRuleParam(model) {
            var recurrenceRuleParam = {};
            recurrenceRuleParam.interval = parseInt(model.interval, 10);
            recurrenceRuleParam.frequency = model.frequency;
            recurrenceRuleParam.until = model.infinite ? null : model.endedAt;
            recurrenceRuleParam.startedAt = model.startedAt;
            recurrenceRuleParam.byday = getByDay(model);
            recurrenceRuleParam.bymonthday = getByMonthDay(model);
            recurrenceRuleParam.bymonth = getByMonth(model);
            return recurrenceRuleParam;
        }

        function getByDay(model) {
            if (model.frequency === 'weekly') {
                return _(model.detailWeeklyInterval).pickBy().keys().value().join(',');
            }
            if ((model.frequency === 'monthly' || model.frequency === 'yearly') && model.detailInterval === 'dayOfWeek') {
                return CalendarRecurrenceRuleSummaryUtil.countWeekdayInMonth(model.startedAt) + moment(model.startedAt).locale('en').format('dd').toUpperCase();
            }
            return '';
        }

        function getByMonthDay(model) {
            if ((model.frequency === 'monthly' || model.frequency === 'yearly') && model.detailInterval === 'dayOfMonth') {
                return moment(model.startedAt).get('date');
            }
            return '';
        }

        function getByMonth(model) {
            //moment의 month는 1을 뺀 값(javascript)
            if (model.frequency === 'yearly') {
                return moment(model.startedAt).get('month') + 1;
            }
            return '';
        }

        //API Data -> model Data
        function convertRecurrenceRuleParamToModel(form) {
            var model = {},
                recurrenceRuleParam = form.recurrenceRule || {};

            model.interval = recurrenceRuleParam.interval || 1;
            model.frequency = recurrenceRuleParam.frequency || 'weekly';
            model.startedAt = recurrenceRuleParam.startedAt || form.startedAt;
            model.endedAt = recurrenceRuleParam.until || moment(form.startedAt).add('months', 1).format();
            model.infinite = recurrenceRuleParam.until === null;
            model.detailWeeklyInterval = getDetailWeeklyInterVal(model, recurrenceRuleParam.byday);
            model.detailInterval = getDetailInterVal(recurrenceRuleParam.bymonthday);
            return model;
        }

        function getDetailWeeklyInterVal(model, byday) {
            var detailInterval = {},
                bydays = model.frequency === 'weekly' && byday && byday !== '' ? byday.split(',')
                    : [moment(model.startedAt).locale('en').format('dd').toUpperCase()];
            _.forEach(bydays, function (byday) {
                detailInterval[byday] = true;
            });
            return detailInterval;
        }

        function getDetailInterVal(bymonthday) {
            return bymonthday && bymonthday !== '' ? 'dayOfMonth' : 'dayOfWeek';
        }

    }


    /* @ngInject */
    function CalendarRecurrenceRuleModalCtrl($scope, $uibModalInstance, CalendarRecurrenceRuleSummaryUtil, CalendarRecurrenceRuleModalConverter, form) {

        function init() {
            $scope.recurrenceRuleLabelItems = CalendarRecurrenceRuleSummaryUtil.items;
            $scope.rule = CalendarRecurrenceRuleModalConverter.convertToModel(form);
        }

        $scope.ok = function () {
            if (!($scope.rule.interval > 0)) {
                return;
            }
            form.recurrenceRule = CalendarRecurrenceRuleModalConverter.convertToParam($scope.rule);
            $uibModalInstance.close('success');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.getLabel = function (value, frequency) {
            return CalendarRecurrenceRuleSummaryUtil.getLabel(value, frequency, $scope.rule.startedAt);
        };

        $scope.getSummary = function () {
            return CalendarRecurrenceRuleSummaryUtil.getSummary(CalendarRecurrenceRuleModalConverter.convertToParam($scope.rule));
        };

        init();
    }

})();
