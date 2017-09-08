/**
 * @ngdoc directive
 * @name doorayWebApp.directive:filteredNgModel
 * @description
 * # filteredNgModel
 * http://alexperry.io/angularjs/2014/12/10/parsers-and-formatters-angular.html
 * http://jsfiddle.net/L57Vp/1/
 */

(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .directive('filteredNgModel', FilteredNgModel);

    /* @ngInject */
    function FilteredNgModel($parse) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModelCtrl) {
                //https://cameronspear.com/blog/how-cool-are-formatters-and-parsers/
                if (!attrs.filteredNgModel) {
                    return;
                }

                var filterModelExp = $parse(attrs.filteredNgModel);
                var val, filteredValue, caretPos;
                var filterModel = function (input) {
                    return filterModelExp(scope, {$viewValue: input || ''});
                };

                //이벤트 keyup 시 filterNgModel 조건에 걸려 원래입력값과 다른 경우 키입력 전파를 막고 필터 적용된 값으로 대체 후 caret 위치를 재조정
                element.on('keyup', function (event) {
                    val = element.val();
                    filteredValue = filterModel(val);
                    if (filteredValue !== val) {
                        event.preventDefault();
                        caretPos = element[0].selectionStart + filteredValue.length - val.length;
                        element.val(filteredValue);
                        element[0].setSelectionRange(caretPos, caretPos);
                    }
                });

                scope.$on('$destroy', function () {
                    element.off('keyup');
                });

                //model -> view and will be only called when model changes in code.
                var toView = function (modelValue) {
                    return filterModel(modelValue);
                };

                //view -> model and will be applied when input types by keyboard.
                var toModel = function (viewValue) {
                    //view 에서 입력된 값을 filter replace 후 즉시 commit (내부 validation 실행)
                    var filteredValue = filterModel(viewValue);
                    ngModelCtrl.$setViewValue(filteredValue);
                    ngModelCtrl.$commitViewValue();
                    return filteredValue;
                };

                ngModelCtrl.$formatters.unshift(toView);
                ngModelCtrl.$parsers.unshift(toModel);
            }
        };
    }

})();
