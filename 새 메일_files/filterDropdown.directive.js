(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('filterDropdown', filterDropdown);

    /* @ngInject */
    function filterDropdownController($scope, _) {
        $scope.filterText = '';
        $scope.opened = false;

        $scope.onToggled = function (/*open*/) {
            $scope.filterText = '';
        };

        //입력받은 속성만 진행하도록 변경
        $scope.createMatchingRule = function (viewValue) {
            var filteredItem = {};
            for (var prop in $scope.property) {
                if (prop === 'model') {
                    continue;
                }
                filteredItem[$scope.property[prop]] = viewValue;
            }

            return _.isEmpty(filteredItem) ? viewValue : filteredItem;
        };

        var propertyLabel = _.get($scope, 'property.label');
        var propertyModel = _.get($scope, 'property.model');
        $scope.getLabel = function (item) {
            return _.get(item, propertyLabel, item);
        };

        $scope.getModel = function (item) {
            return _.get(item, propertyModel, item);
        };

        $scope.$watch('filterText', function (newVal) {
            //검색어의 여부에 따라 대상 목록을 결정함
            $scope.matchItemList = newVal ? $scope.filteredTypeaheadItemList : $scope.filteredDropdownItemList;
        });
    }

    /* @ngInject */
    function filterDropdown($timeout, $uibPosition, _) {
        return {
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'modules/components/filterDropdown/filterDropdown.html';
            },
            restrict: 'EA',
            require: 'ngModel',
            transclude: 'true',
            scope: {
                ngModel: '=',
                ngDisabled: '=',
                property: '=',
                filterBy: '=?',
                opened: '=?isOpen',
                buttonTemplateUrl: '@',
                dropdownItemList: '=',
                typeaheadItemList: '=',
                typeaheadTemplateUrl: '@',
                typeaheadPopupTemplateUrl: '@',
                disableAsyncPosition: '@',
                placeholderText: '@',
                defaultLabelText: '@',
                labelTextFixed: '@',
                limitTo: '@',
                onSelect: '&',
                onOpen: '&'

            },
            controller: filterDropdownController,
            link: function (scope, element, attrs, ngModelCtrl) {
                var input$ = element.find('input');

                function findItemByModel(model) {
                    return _.find(scope.typeaheadItemList, function (item) {
                        return scope.getModel(item) === model;
                    });
                }

                ngModelCtrl.$render = function () {
                    scope.selectedItem = findItemByModel(ngModelCtrl.$modelValue);
                    scope.displayName = scope.labelTextFixed === 'true' ? scope.defaultLabelText : ( scope.selectedItem ? scope.getLabel(scope.selectedItem) : scope.defaultLabelText );
                };

                scope.buttonTemplateUrl = scope.buttonTemplateUrl || 'modules/components/filterDropdown/filterDropdownButtonTpl.html';

                //목록이 표시될 경우 버튼에 표시되는 값과 매칭되는 목록 아이템을 선택한 것 처럼 표시 (DropDown 흉내)
                scope.$watch('opened', function (newVal) {
                    if (newVal) {
                        scope.onOpen();
                        asyncListPosition();
                        if (_.get(scope.dropdownItemList, 'length', 0) > 0) {
                            asyncSelectItemInList();
                        }
                    }
                });

                scope.removeFilterText = function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    scope.filterText = '';
                    ngModelCtrl.$render();
                };

                function asyncListPosition() {
                    if (!scope.disableAsyncPosition) {
                        //dropdown-menu를 화면 영역상에 노출되도록 위치를 계산하고 target$ 숨김 시 width, height를 계산하기 위해 화면 표시
                        var target$ = element.find('.dropdown-menu');
                        if (!target$.is(':visible')) {
                            target$.parent().addClass('open');
                        }
                        var position = $uibPosition.positionElements(element.find('button'), target$, 'auto bottom-left');
                        target$.css({top: position.top + 'px', left: position.left + 'px'});
                    }
                }

                function asyncSelectItemInList() {
                    //focus-me directive 사용 시 기본값이 150ms로 지정되어 현재 선택된 프로젝트를 선택 유지하기 위해 200ms로 고정
                    $timeout(function () {
                        var popupId = element.find('input[uib-typeahead]').attr('aria-owns');
                        if (popupId) {
                            var activeIdx = -1;
                            _.forEach(scope.dropdownItemList, function (item, index) {
                                if (scope.getModel(item) === ngModelCtrl.$modelValue) {
                                    activeIdx = index;
                                    return false;
                                }
                            });
                            if (activeIdx > 0) {
                                angular.element('#' + popupId).find('li:nth(' + activeIdx + ')').trigger('mouseenter');
                            }
                        }
                    }, 200, false);
                }

                var fetchFilteredList = function () {
                    scope.filteredDropdownItemList = _.filter(scope.dropdownItemList, scope.filterBy);
                    scope.filteredTypeaheadItemList = _.filter(scope.typeaheadItemList, scope.filterBy);
                };

                var focusInput = function () {
                    $timeout(function () {
                        input$.focus();
                    }, 0, false);
                };

                scope.$watch('dropdownItemList', function () {
                    ngModelCtrl.$render();
                    fetchFilteredList();
                });

                scope.$watch('typeaheadItemList', function () {
                    ngModelCtrl.$render();
                    fetchFilteredList();
                });

                scope.$watch('filterBy', function () {
                    fetchFilteredList();
                    if (scope.opened) {
                        focusInput();
                    }
                });

                scope.selectItem = function (item, model, label) {
                    scope.opened = false;
                    scope.ngModel = scope.getModel(item);
                    scope.onSelect({
                        item: item,
                        model: model,
                        label: label
                    });
                };
            }
        };
    }

})();
