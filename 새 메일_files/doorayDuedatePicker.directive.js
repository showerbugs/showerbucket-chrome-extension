(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .directive('doorayDuedatePicker', DoorayDuedatePicker);

    /* @ngInject */
    function DoorayDuedatePicker($q, DateConvertUtil, DueDateService, MessageModalFactory, moment, KEYS, gettextCatalog) {
        return {
            replace: true,
            restrict: 'E',
            scope: {
                'dueDate': '=',
                'dueDateFlag': '=',
                'ngDisabled': '<',
                'workflowClass': '<',
                'incrementDayUnitForDefault': '@'
            },
            templateUrl: 'modules/project/components/doorayDuedatePicker/doorayDuedatePicker.html',
            compile: function () {
                return {
                    pre: PreFunction,
                    post: PostFunction
                };
            }
        };

        function PreFunction(scope) {
            scope.DUE_DATE_MODES = DueDateService.DUE_DATE_MODES;
            scope.incrementDayUnitForDefault = angular.fromJson(scope.incrementDayUnitForDefault) || 1;

            scope.timeOptions = _getTimeOptions();

            scope.preventEnterEvent = function (event) {
                if (event.which === KEYS.ENTER) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            };
        }

        function PostFunction(scope) {
            var lastValidDueDate = '',
                dueDateModeCache = null;

            var changeDueDateModeTo = {};
            changeDueDateModeTo[scope.DUE_DATE_MODES.ENABLED] = _changeDueDateModeToEnabled;
            changeDueDateModeTo[scope.DUE_DATE_MODES.UNPLANNED] = _changeDueDateModeToUnplanned;
            changeDueDateModeTo[scope.DUE_DATE_MODES.NONE] = _changeDueDateModeToNone;

            scope.vm = {
                dueDate: '',
                time: '00:00'
            };

            scope.onDueDateModeChanged = onDueDateModeChanged;
            scope.onChangeDate = onChangeDate;
            scope.onChangeTime = onChangeTime;

            _init();

            scope.$watchGroup(['dueDate', 'dueDateFlag'], function (newVal) {
                _setDueDateMode(DueDateService.calcDueDateMode(newVal[0], newVal[1]));
                _setValidDueDate(newVal[0]);
            });

            function onDueDateModeChanged() {
                changeDueDateModeTo[scope.dueDateMode]().then(function () {
                    _setDueDateMode(scope.dueDateMode);
                }, function () {
                    _setDueDateMode(dueDateModeCache);
                });
            }

            function onChangeDate() {
                if (!DateConvertUtil.isValidDate(scope.dueDate)) {
                    _alertInvalidMsg(gettextCatalog.getString('입력한 날짜에 오류가 있습니다. 다시 입력해 주세요.'));
                    scope.vm.dueDate = _getPreviousDateTime();
                    scope.vm.time = moment(scope.vm.dueDate).format('HH:mm');
                }
                scope.dueDate = scope.vm.dueDate;
            }

            function onChangeTime() {
                scope.dueDate = moment(scope.vm.dueDate).hour(moment(scope.vm.time, 'HH:mm').hour());
            }

            function _init() {
                //기본 dueDate = 미정
                _setDueDateMode(scope.DUE_DATE_MODES.UNPLANNED);
                if (scope.dueDate) {
                    _setValidDueDate(scope.dueDate);
                }
            }

            function _setDueDateMode(dueDateMode) {
                scope.dueDateMode = dueDateMode;
                dueDateModeCache = dueDateMode;
            }

            function _setValidDueDate(dueDate) {
                if (DateConvertUtil.isValidDate(dueDate)) {
                    lastValidDueDate = moment(dueDate).startOf('hour').format();
                    scope.vm.dueDate = lastValidDueDate;
                    scope.vm.time = moment(scope.vm.dueDate).format('HH:mm');
                    scope.dueDate = lastValidDueDate;
                }
            }

            function _changeDueDateModeToEnabled() {
                scope.opened = true; // data picker창 열려 있도록
                scope.dueDate = _getPreviousDateTime();
                scope.dueDateFlag = true;
                return $q.when();
            }

            function _changeDueDateModeToUnplanned() {
                scope.dueDate = null;
                scope.dueDateFlag = true;
                return $q.when();
            }

            function _changeDueDateModeToNone() {
                if (scope.workflowClass === 'working') {
                    var msg = gettextCatalog.getString('<p>완료일이 없어지면 담당자의 "진행 중"</p><p>상태가 자동으로 "완료"로 변경됩니다.</p><p>완료일을 변경하시겠습니까?</p>');
                    return MessageModalFactory.confirm(msg).result.then(function () {
                        scope.dueDate = null;
                        scope.dueDateFlag = false;
                        return $q.when();
                    });
                }
                scope.dueDate = null;
                scope.dueDateFlag = false;
                return $q.when();
            }

            function _getPreviousDateTime() {
                return lastValidDueDate || moment().add(scope.incrementDayUnitForDefault, 'day').startOf('hour').format();
            }

            function _alertInvalidMsg(msg) {
                msg && MessageModalFactory.alert(msg);
            }
        }

        function _getTimeOptions() {
            return [{
                "value": "00:00",
                "label": gettextCatalog.getString('00시')
            }, {
                "value": "01:00",
                "label": gettextCatalog.getString('01시')
            }, {
                "value": "02:00",
                "label": gettextCatalog.getString('02시')
            }, {
                "value": "03:00",
                "label": gettextCatalog.getString('03시')
            }, {
                "value": "04:00",
                "label": gettextCatalog.getString('04시')
            }, {
                "value": "05:00",
                "label": gettextCatalog.getString('05시')
            }, {
                "value": "06:00",
                "label": gettextCatalog.getString('06시')
            }, {
                "value": "07:00",
                "label": gettextCatalog.getString('07시')
            }, {"value": "08:00",
                "label": gettextCatalog.getString('08시')
            }, {
                "value": "09:00",
                "label": gettextCatalog.getString('09시')
            }, {
                "value": "10:00",
                "label": gettextCatalog.getString('10시')
            }, {
                "value": "11:00",
                "label": gettextCatalog.getString('11시')
            }, {
                "value": "12:00",
                "label": gettextCatalog.getString('12시')
            }, {
                "value": "13:00",
                "label": gettextCatalog.getString('13시')
            }, {
                "value": "14:00",
                "label": gettextCatalog.getString('14시')
            }, {
                "value": "15:00",
                "label": gettextCatalog.getString('15시')
            }, {
                "value": "16:00",
                "label": gettextCatalog.getString('16시')
            }, {
                "value": "17:00",
                "label": gettextCatalog.getString('17시')
            }, {
                "value": "18:00",
                "label": gettextCatalog.getString('18시')
            }, {
                "value": "19:00",
                "label": gettextCatalog.getString('19시')
            }, {
                "value": "20:00",
                "label": gettextCatalog.getString('20시')
            }, {
                "value": "21:00",
                "label": gettextCatalog.getString('21시')
            }, {
                "value": "22:00",
                "label": gettextCatalog.getString('22시')
            }, {
                "value": "23:00",
                "label": gettextCatalog.getString('23시')
            }];
        }
    }

})();
