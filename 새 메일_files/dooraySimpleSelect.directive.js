(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .directive('dooraySimpleSelect', DooraySimpleSelect);

    /* @ngInject */
    function DooraySimpleSelect($document, $timeout, DigestService, KEYS, _) {
        return {
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'modules/share/directives/dooraySimpleSelect/dooraySimpleSelect.html';
            },
            restrict: 'EA',
            require: 'ngModel',
            scope: {
                ngDisabled: '=?',
                options: '=',            // [{id: 1, propertyName: value}] or [value1, value2]
                displayProperty: '@',
                valueProperty: '@',
                defaultBtnTitle: '@',
                onSelect: '&',
                keepPrevLabel: '<'
            },
            link: function (scope, element, attrs, ngModelCtrl) {
                var element$ = angular.element(element),
                    targetActions = {},
                    selectedData;

                // key binding에 대응하는 함수들
                targetActions[KEYS.DOWN] = function () {
                    scope.activeIndex += 1;
                    scope.activeIndex = scope.activeIndex === scope.options.length ? 0 : scope.activeIndex;
                    DigestService.safeLocalDigest(scope);
                };
                targetActions[KEYS.UP] = function () {
                    scope.activeIndex -= 1;
                    scope.activeIndex = scope.activeIndex < 0 ? scope.options.length - 1 : scope.activeIndex;
                    DigestService.safeLocalDigest(scope);
                };
                targetActions[KEYS.ESC] = function () {
                    closePane();
                };

                ngModelCtrl.$render = function () {
                    var targetIndex,
                        target = _.find(scope.options, function (option, index) {
                            targetIndex = index;
                            return ngModelCtrl.$modelValue === (_.isObject(option) ? option[scope.valueProperty] : option);
                        }),
                        targetProperty = _.isObject(target) ? target[scope.displayProperty] : target;

                    scope.isSelected = !!targetProperty;

                    if(scope.keepPrevLabel && !targetProperty && selectedData) {
                        scope.btnTitle = selectedData[scope.displayProperty];
                    } else {
                        scope.btnTitle = targetProperty || scope.defaultBtnTitle || ngModelCtrl.$modelValue || '';
                    }
                    setActiveIndex(target && targetIndex);
                };

                scope.openPane = function () {
                    scope.isOpen = !scope.isOpen;
                    setActiveIndex();

                    if (scope.isOpen) {
                        $timeout(function () {
                            $document.on('click', closePane);
                        }, 0, false);
                    }
                };

                scope.select = function (option) {
                    var prevData = ngModelCtrl.$viewValue;
                    ngModelCtrl.$setViewValue(_.isObject(option) ? option[scope.valueProperty] : option);
                    ngModelCtrl.$render();
                    selectedData = option;
                    $timeout(function () {
                        scope.onSelect({data: option, prevValue: prevData});
                    }, 0);
                };

                scope.$watch('options', function () {
                    ngModelCtrl.$render();
                });

                function setActiveIndex(index) {
                    if (index) {
                        scope.activeIndex = index;
                        return;
                    }
                    scope.activeIndex = _.findIndex(scope.options, function (option) {
                        return ngModelCtrl.$modelValue === (_.isObject(option) ? option[scope.valueProperty] : option);
                    });
                    scope.activeIndex = scope.activeIndex < 0 ? 0 : scope.activeIndex;
                }

                function closePane() {
                    scope.isOpen = false;
                    DigestService.safeLocalDigest(scope);
                    $document.off('click', closePane);
                }

                function init() {
                    // key binding
                    element$.on('keydown', function (event) {
                        if (_.isFunction(targetActions[event.which])) {
                            event.preventDefault();
                            event.stopPropagation();
                            targetActions[event.which]();
                        }
                    });

                    // event 제거
                    scope.$on('$destroy', function () {
                        $document.off('click', closePane);
                        element$.off('keydown');
                    });
                }

                init();
            }
        };
    }

})();
