(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('doorayDatePicker', DoorayDatePicker);

    /* @ngInject */
    function DoorayDatePicker(moment) {
        return {
            templateUrl: 'modules/components/doorayDatePicker/doorayDatePicker.html',
            restrict: 'EA',
            replace: true,
            require: 'ngModel',
            scope: {
                isOpen: '=?',
                ngDisabled: '<',
                ngKeydown: '&',
                minDate: '@',
                unsafeResult: '@'
            },
            link: {
                pre: function (scope/*, element, attrs*/) {
                    scope.dateOptions = {
                        formatDayTitle: 'yyyy. MM',
                        formatDayHeader: 'EEE',
                        showWeeks: false,
                        startingDay: 0,
                        minDate: scope.minDate ? moment(scope.minDate).toDate() : null
                    };
                    scope.ngModelOptions= {
                        timezone: moment().format('ZZ')
                    };
                },
                post: function (scope, element, attrs, ngModelCtrl) {
                    scope.openPicker = openPicker;
                    scope.keydown = keydown;
                    var prevValue = moment().toDate(),
                        unsafeResult = angular.fromJson(scope.unsafeResult);

                    ngModelCtrl.$render = function () {
                        _setDateData(ngModelCtrl.$modelValue);
                    };

                    scope.$watch('dateData', function (value) {
                        if (!value) {
                            if (unsafeResult) {
                                // value가 정합성이 안맞는 경우 undefined로 넘어옴 그 때의 예외처리
                                return ngModelCtrl.$setViewValue(null);
                            }
                            scope.dateData = prevValue;
                            return;
                        }

                        var momentValue = moment(value);
                        if (momentValue.format() !== 'Invalid date' && !momentValue.isSame(ngModelCtrl.$modelValue, 'day')) {
                            ngModelCtrl.$setViewValue(momentValue.format());
                            prevValue = value;
                        }
                    });

                    function openPicker($event) {
                        $event.preventDefault();
                        scope.isOpen = true;
                    }

                    function keydown($event) {
                        scope.ngKeydown({$event: $event});
                    }

                    function _setDateData(value) {
                        if (!unsafeResult && (value === 'Invalid date' || _.isNull(value))) {
                            scope.dateData = prevValue;
                            return;
                        }
                        scope.dateData = moment(value).toDate();
                        prevValue = scope.dateData;
                    }
                }
            }
        };
    }

})();
