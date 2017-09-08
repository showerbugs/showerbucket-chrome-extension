(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('doorayDatetimePicker', DoorayDatetimePicker);

    /* @ngInject */
    function DoorayDatetimePicker($q, DateConvertUtil, HelperPromiseUtil, MessageModalFactory, moment, KEYS, gettextCatalog, _) {
        return {
            replace: true,
            transclude: true,
            restrcit: 'EA',
            require: ['doorayDatetimePicker', '?^ngModel'],
            scope: {
                ngModel: '=',
                ngDisabled: '<',
                ngDisabledDate: '<',
                ngDisabledTime: '<',
                onBeforeSelect: '&',
                onChange: '&'
            },
            templateUrl: 'modules/components/doorayDatetimePicker/doorayDatetimePicker.html',
            link: function (scope, element, attrs, ctrls) {
                var doorayDatetimePickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

                if (ngModelCtrl) {
                    doorayDatetimePickerCtrl.init(ngModelCtrl);
                }
            },
            controller: ['$scope', '$attrs', '$parse', function ($scope, $attrs) {
                var DEFAULT_DATETIME_OPTIONS = {now: true, incrementUnitDay: 0, onTime: true, incrementUnitHour: 1},    //금일 현재 정각 + 1시간
                    defaultDatetimeOptions = _.assign({}, DEFAULT_DATETIME_OPTIONS, angular.isDefined($attrs.defaultDatetimeOptions) ? $scope.$eval($attrs.defaultDatetimeOptions) : {}),
                    ngModelCtrl = {$setViewValue: angular.noop, $setValidity: angular.noop}; // nullModelCtrl
                $scope.datepickerOptions = {
                    formatDayTitle: 'yyyy. MM',
                    formatDayHeader: 'EEE',
                    showWeeks: false,
                    startingDay: 0
                };

                $scope.vm = {
                    selectedDateTime: null,
                    lastSelectedDateTime: null
                };

                $scope.open = function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.opened = true;
                };

                function syncViewValueToModel(force) {
                    var value = $scope.vm.selectedDateTime ? moment($scope.vm.selectedDateTime).format(): null;

                    if (force) {
                        ngModelCtrl.$setViewValue(value);
                        return;
                    }

                    var beforeSelectPromise = $scope.onBeforeSelect({$viewValue: value});
                    beforeSelectPromise = HelperPromiseUtil.isPromiseLike(beforeSelectPromise) ? beforeSelectPromise : $q.when();
                    return beforeSelectPromise.then(function () {
                        ngModelCtrl.$setViewValue(value);
                    });
                }

                function resetDateTime(dateTimeString) {
                    $scope.vm.lastSelectedDateTime = $scope.vm.selectedDateTime = dateTimeString ? moment(dateTimeString).format() : null;
                }

                $scope.$watch('vm.selectedDateTime', function (newVal, oldVal) {
                    if (newVal === oldVal || moment(newVal).format() === moment(oldVal).format()) {
                        return;
                    }
                    syncViewValueToModel(true);
                    $scope.onChange();
                });

                $scope.$watch('ngModel', function (newVal) {
                    resetDateTime(newVal);
                    syncViewValueToModel();
                });

                $scope.onChangeDate = function () {
                    if (!DateConvertUtil.isValidDate($scope.vm.selectedDateTime)) {
                        var lastSelectedDate = $scope.vm.lastSelectedDateTime;
                        MessageModalFactory.alert(gettextCatalog.getString('입력한 날짜에 오류가 있습니다. 다시 입력해 주세요.')).result.finally(function(){
                            $scope.vm.selectedDateTime = lastSelectedDate;
                            syncViewValueToModel(true);
                            $scope.onChange();
                        });
                    }
                };

                $scope.preventEnterEvent = function (event) {
                    if (event.which === KEYS.ENTER) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                };

                this.init = function (_ngModelCtrl_) {
                    ngModelCtrl = _ngModelCtrl_;
                    ngModelCtrl.$render = this.render;
                    resetDateTime($scope.ngModel);

                    //DATE TIME 신규일경우 옵션에 설정된 정책에 따라 값 할당하고 form model값도 업데이트를 해둠
                    //$scope.vm.selectedDate = (!$scope.vm.selectedDate && defaultDatetimeOptions.now) ? moment().startOf('day').add(defaultDatetimeOptions.incrementUnitDay, 'day').utcOffset(-TIMEZONE_OFFSET).toDate() : $scope.vm.selectedDate;
                    //$scope.vm.selectedTime = (!$scope.vm.selectedTime && defaultTimeOptions.now) ? moment().startOf(defaultTimeOptions.onTime ? 'hour' : 'minute').add(defaultTimeOptions.incrementUnitHour, 'hour').utcOffset(-TIMEZONE_OFFSET).toDate() : $scope.vm.selectedTime;
                    $scope.vm.selectedDateTime = (!$scope.vm.selectedDateTime && defaultDatetimeOptions.now) ?
                        moment().add(defaultDatetimeOptions.incrementUnitDay, 'day')
                            .startOf(defaultDatetimeOptions.onTime ? 'hour' : 'minute').add(defaultDatetimeOptions.incrementUnitHour, 'hour').format() :
                        $scope.vm.selectedDateTime;
                    syncViewValueToModel(true);
                };

                this.render = function () {
                    ngModelCtrl.$setValidity('datetime', !!$scope.vm.selectedDateTime);
                };
            }]
        };
    }

})();
