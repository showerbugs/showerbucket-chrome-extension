(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .constant('DOORAY_COLORS', [
            '#e11d21',
            '#eb6420',
            '#fbca04',
            '#009800',
            '#006b75',
            '#207de5',
            '#0052cc',
            '#5319e7',
            '#f7c6c7',
            '#fad8c7',
            '#fef2c0',
            '#bfe5bf',
            '#bfdadc',
            '#c7def8',
            '#bfd4f2',
            '#d4c5f9',
            '#eeeeee',
            '#dddddd',
            '#cccccc',
            '#bbbbbb',
            '#aaaaaa',
            '#999999',
            '#888888',
            '#777777'
        ])
        .directive('doorayColorPicker', DoorayColorPicker);

    /* @ngInject */
    function DoorayColorPicker(PATTERN_REGEX, TAG_COLOR_SET, _) {
        return {
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'modules/components/doorayColorPicker/doorayColorPicker.html';
            },
            scope: {
                customColors: '<',
                selectedColor: '=',
                usedColors: '<',
                resetWhen: '=?',
                customDisabled: '<',
                onChange: '&'
            },
            restrict: 'AE',
            controller: ['$scope', 'KEYS', 'REPLACE_REGEX', function ($scope, KEYS, REPLACE_REGEX) {
                $scope.REPLACE_REGEX = REPLACE_REGEX;
                $scope.preventDefaultEvent = {};
                $scope.preventDefaultEvent[KEYS.ENTER] = null;
            }],
            link: function (scope) {
                var usedColorsMap = {},
                    defaultColor = null;

                scope.$watch('colorInput', function (newVal) {
                    if (!newVal) {
                        return;
                    }

                    scope.selectedColor = PATTERN_REGEX.cssColor.test(newVal) ? newVal : defaultColor;
                });

                var setDefaultColor = function (color) {
                    defaultColor = color;
                    scope.colorInput = color;
                };

                var init = function () {
                    scope.colors = scope.customColors || _.map(TAG_COLOR_SET, '[0]');

                    if (!scope.usedColors || scope.selectedColor) {
                        setDefaultColor(scope.selectedColor);
                        return;
                    }

                    var subColorArray = _.difference(scope.colors, scope.usedColors);
                    if (subColorArray.length > 0) {
                        scope.selectedColor = subColorArray.shift();
                        setDefaultColor(scope.selectedColor);
                        return;
                    }

                    _.forEach(scope.usedColors, function (color) {
                        usedColorsMap[color] = usedColorsMap[color] ? usedColorsMap[color] + 1 : 1;
                    });

                    var colorCandidate = _.values(_.invert(usedColorsMap, true))[0];
                    scope.selectedColor = _.find(scope.colors, function (color) {
                        return colorCandidate === color;
                    });
                    setDefaultColor(scope.selectedColor);
                };

                scope.$watch('resetWhen', init);
                init();

                scope.pick = function (color) {
                    scope.colorInput = color;
                    if(scope.onChange) {
                        scope.onChange({color: color});
                    }
                };

            }
        };
    }

})();
