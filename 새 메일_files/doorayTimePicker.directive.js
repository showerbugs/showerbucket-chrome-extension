(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .constant('doorayTimepickerConfig', {
            hourStep: 1,
            minuteStep: 1,
            showMeridian: true,
            meridians: null,
            readonlyInput: false,
            ngDisabled: false,
            mousewheel: true,
            arrowkeys: true,
            showSpinners: true
        })
        .directive('doorayTimePicker', DoorayTimePicker)
        .controller('DoorayTimepickerController', DoorayTimepickerController);

    //ui-bootstrap의 timepicker 디렉티비를 기본으로 ng-model이 null일때 현재 시간이 아닌 빈 공백으로 처리함
    //http://angular-ui.github.io/bootstrap/#/timepicker

    /* @ngInject */
    function DoorayTimePicker() {
        return {
            restrict: 'EA',
            require: ['doorayTimePicker', '?^ngModel'],
            controller: 'DoorayTimepickerController',
            replace: true,
            scope: {},
            templateUrl: 'modules/components/doorayTimePicker/doorayTimePicker.html',
            link: function (scope, element, attrs, ctrls) {
                var timepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

                if (ngModelCtrl) {
                    timepickerCtrl.init(ngModelCtrl, element.find('input'));
                }
            }
        };
    }

    /* @ngInject */
    function DoorayTimepickerController($scope, $attrs, $parse, $log, $locale, doorayTimepickerConfig, moment) {
        var selected = moment(),
            ngModelCtrl = {$setViewValue: angular.noop}, // nullModelCtrl
            meridians = angular.isDefined($attrs.meridians) ? $scope.$parent.$eval($attrs.meridians) : doorayTimepickerConfig.meridians || $locale.DATETIME_FORMATS.AMPMS;

        this.init = function (ngModelCtrl_, inputs) {
            ngModelCtrl = ngModelCtrl_;
            ngModelCtrl.$render = this.render;

            ngModelCtrl.$formatters.unshift(function (modelValue) {
                return modelValue ? new Date(modelValue) : null;
            });

            var hoursInputEl = inputs.eq(0),
                minutesInputEl = inputs.eq(1);

            var mousewheel = angular.isDefined($attrs.mousewheel) ? $scope.$parent.$eval($attrs.mousewheel) : doorayTimepickerConfig.mousewheel;
            if (mousewheel) {
                this.setupMousewheelEvents(hoursInputEl, minutesInputEl);
            }

            var arrowkeys = angular.isDefined($attrs.arrowkeys) ? $scope.$parent.$eval($attrs.arrowkeys) : doorayTimepickerConfig.arrowkeys;
            if (arrowkeys) {
                this.setupArrowkeyEvents(hoursInputEl, minutesInputEl);
            }

            $scope.readonlyInput = angular.isDefined($attrs.readonlyInput) ? $scope.$parent.$eval($attrs.readonlyInput) : doorayTimepickerConfig.readonlyInput;
            $scope.$parent.$watch($parse($attrs.ngDisabled), function(newVal){
                $scope.ngDisabled =  newVal;
            });
            this.setupInputEvents(hoursInputEl, minutesInputEl);
        };

        var hourStep = doorayTimepickerConfig.hourStep;
        if ($attrs.hourStep) {
            $scope.$parent.$watch($parse($attrs.hourStep), function (value) {
                hourStep = parseInt(value, 10);
            });
        }

        var minuteStep = doorayTimepickerConfig.minuteStep;
        if ($attrs.minuteStep) {
            $scope.$parent.$watch($parse($attrs.minuteStep), function (value) {
                minuteStep = parseInt(value, 10);
            });
        }

        // 12H / 24H mode
        $scope.showMeridian = doorayTimepickerConfig.showMeridian;
        if ($attrs.showMeridian) {
            $scope.$parent.$watch($parse($attrs.showMeridian), function (value) {
                $scope.showMeridian = !!value;

                if (ngModelCtrl.$error.time) {
                    // Evaluate from template
                    var hours = getHoursFromTemplate(), minutes = getMinutesFromTemplate();
                    if (angular.isDefined(hours) && angular.isDefined(minutes)) {
                        selected.hour(hours);
                        refresh();
                    }
                } else {
                    updateTemplate();
                }
            });
        }

        // Get $scope.hours in 24H mode if valid
        function getHoursFromTemplate() {
            var hours = parseInt($scope.hours, 10);
            var valid = ($scope.showMeridian) ? (hours > 0 && hours < 13) : (hours >= 0 && hours < 24);
            if (!valid) {
                return undefined;
            }

            if ($scope.showMeridian) {
                if (hours === 12) {
                    hours = 0;
                }
                if ($scope.meridian === meridians[1]) {
                    hours = hours + 12;
                }
            }
            return hours;
        }

        function getMinutesFromTemplate() {
            var minutes = parseInt($scope.minutes, 10);
            return (minutes >= 0 && minutes < 60) ? minutes : undefined;
        }

        function pad(value) {
            if (value === null) {
                return '';
            }
            return (angular.isDefined(value) && value.toString().length < 2) ? '0' + value : value.toString();
        }

        // Respond on mousewheel spin
        this.setupMousewheelEvents = function (hoursInputEl, minutesInputEl) {
            var isScrollingUp = function (e) {
                if (e.originalEvent) {
                    e = e.originalEvent;
                }
                //pick correct delta variable depending on event
                var delta = (e.wheelDelta) ? e.wheelDelta : -e.deltaY;
                return (e.detail || delta > 0);
            };

            hoursInputEl.bind('mousewheel wheel', function (e) {
                if($scope.ngDisabled){return;}
                $scope.$apply((isScrollingUp(e)) ? $scope.incrementHours() : $scope.decrementHours());
                e.preventDefault();
            });

            minutesInputEl.bind('mousewheel wheel', function (e) {
                if($scope.ngDisabled){return;}
                $scope.$apply((isScrollingUp(e)) ? $scope.incrementMinutes() : $scope.decrementMinutes());
                e.preventDefault();
            });

        };

        // Respond on up/down arrowkeys
        this.setupArrowkeyEvents = function (hoursInputEl, minutesInputEl) {
            hoursInputEl.bind('keydown', function (e) {
                if($scope.ngDisabled){return;}
                if (e.which === 38) { // up
                    e.preventDefault();
                    $scope.incrementHours();
                    $scope.$apply();
                }
                else if (e.which === 40) { // down
                    e.preventDefault();
                    $scope.decrementHours();
                    $scope.$apply();
                }
                else if (e.which === 13) {
                    $scope.updateHours();
                }
            });

            minutesInputEl.bind('keydown', function (e) {
                if($scope.ngDisabled){return;}
                if (e.which === 38) { // up
                    e.preventDefault();
                    $scope.incrementMinutes();
                    $scope.$apply();
                }
                else if (e.which === 40) { // down
                    e.preventDefault();
                    $scope.decrementMinutes();
                    $scope.$apply();
                }
                else if (e.which === 13) {
                    $scope.updateMinutes();
                }
            });
        };

        this.setupInputEvents = function (hoursInputEl, minutesInputEl) {
            if ($scope.readonlyInput) {
                $scope.updateHours = angular.noop;
                $scope.updateMinutes = angular.noop;
                return;
            }

            var invalidate = function (invalidHours, invalidMinutes) {
                ngModelCtrl.$setViewValue(null);
                ngModelCtrl.$setValidity('time', false);
                if (angular.isDefined(invalidHours)) {
                    $scope.invalidHours = invalidHours;
                }
                if (angular.isDefined(invalidMinutes)) {
                    $scope.invalidMinutes = invalidMinutes;
                }
            };

            $scope.updateHours = function () {
                var minutes = getMinutesFromTemplate();
                var hours = getHoursFromTemplate();

                if (angular.isDefined(hours)) {
                    // Only update hours if there are minutes specified as well
                    if (angular.isDefined(minutes)) {
                        selected.hour(hours);
                        selected.minute(minutes);
                        refresh('h');
                    }
                } else {
                    invalidate(true);
                }
            };

            hoursInputEl.bind('blur', function (/*$event*/) {
                ngModelCtrl.$setTouched();
                if ($scope.hours === null || $scope.hours === "") {
                    invalidate(true);
                } else if (!$scope.invalidHours && $scope.hours < 10) {
                    $scope.$apply(function () {
                        $scope.hours = pad($scope.hours);
                    });
                }
            });

            $scope.updateMinutes = function () {
                var minutes = getMinutesFromTemplate();
                var hours = getHoursFromTemplate();

                if (angular.isDefined(minutes)) {
                    // Only update minutes if there are hours specified as well
                    if (angular.isDefined(hours)) {
                        selected.hour(hours);
                        selected.minute(minutes);
                        refresh('m');
                    }
                } else {
                    invalidate(undefined, true);
                }
            };

            minutesInputEl.bind('blur', function (/*$event*/) {
                ngModelCtrl.$setTouched();
                if ($scope.minutes === null) {
                    invalidate(undefined, true);
                } else if (!$scope.invalidMinutes && $scope.minutes < 10) {
                    $scope.$apply(function () {
                        $scope.minutes = pad($scope.minutes);
                    });
                }
            });

        };

        this.render = function () {
            var date = ngModelCtrl.$viewValue;

            if (isNaN(date)) {
                ngModelCtrl.$setValidity('time', false);
                $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
            } else {
                if (date) {
                    selected = moment(date);
                }
                makeValid();
                updateTemplate();
            }
        };

        // Call internally when we know that model is valid.
        function refresh(keyboardChange) {
            makeValid();
            ngModelCtrl.$setViewValue(moment(selected).format());
            updateTemplate(keyboardChange);
        }

        function makeValid() {
            ngModelCtrl.$setValidity('time', true);
            $scope.invalidHours = false;
            $scope.invalidMinutes = false;
        }

        function updateTemplate(keyboardChange) {
            if (ngModelCtrl.$modelValue === null) {
                $scope.hours = null;
                $scope.minutes = null;
                $scope.meridian = meridians[0];
            }
            else {
                var hours = selected.hour(), minutes = selected.minute();

                if ($scope.showMeridian) {
                    hours = (hours === 0 || hours === 12) ? 12 : hours % 12; // Convert 24 to 12 hour system
                }

                $scope.hours = keyboardChange === 'h' ? hours : pad(hours);
                if (keyboardChange !== 'm') {
                    $scope.minutes = pad(minutes);
                }
                $scope.meridian = selected.hour() < 12 ? meridians[0] : meridians[1];
            }
        }

        function addMinutes(minutes) {
            selected.add(minutes, 'minute');
            refresh();
        }

        $scope.showSpinners = angular.isDefined($attrs.showSpinners) ?
            $scope.$parent.$eval($attrs.showSpinners) : doorayTimepickerConfig.showSpinners;

        $scope.incrementHours = function () {
            addMinutes(hourStep * 60);
        };
        $scope.decrementHours = function () {
            addMinutes(-hourStep * 60);
        };
        $scope.incrementMinutes = function () {
            addMinutes(minuteStep);
        };
        $scope.decrementMinutes = function () {
            addMinutes(-minuteStep);
        };
        $scope.toggleMeridian = function () {
            var minutes = getMinutesFromTemplate();
            var hours = getHoursFromTemplate();
            if (angular.isDefined(minutes) && angular.isDefined(hours)) {
                addMinutes(12 * 60 * ((selected.hour() < 12) ? 1 : -1));
            } else {
                $scope.meridian = $scope.meridian === meridians[0] ? meridians[1] : meridians[0];
            }
        };
    }

})();
