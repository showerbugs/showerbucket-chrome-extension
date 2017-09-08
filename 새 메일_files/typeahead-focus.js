/**
 * created by Yohai Rosen.
 * https://github.com/yohairosen
 * email: yohairoz@gmail.com
 * twitter: @distruptivehobo
 *
 * https://github.com/yohairosen/typeaheadFocus.git
 * Version: 0.0.1
 * License: MIT
 */

angular.module('typeahead-focus', [])
    .directive('typeaheadFocus', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
                var emptyKeyForAllList = '[$empty$]';

                //trigger the popup on 'click' because 'focus'
                //is also triggered after the item selection
                element.bind('focus', function () {

                    var viewValue = ngModel.$viewValue;

                    //restore to null value so that the typeahead can detect a change
                    if (ngModel.$viewValue === emptyKeyForAllList) {
                        ngModel.$setViewValue(null);
                    }

                    //force trigger the popup
                    ngModel.$setViewValue(emptyKeyForAllList);

                    //set the actual value in case there was already a value in the input
                    ngModel.$setViewValue(viewValue || emptyKeyForAllList);
                });

                if (!attr.disableInitialOpen) {
                    scope.$watch(function () {
                        return ngModel.$viewValue;
                    }, function (newVal) {
                        ngModel.$setViewValue(newVal || emptyKeyForAllList);
                    });
                }

                //compare function that treats the empty space as a match
                scope.$emptyOrMatch = function (actual, expected) {
                    if (expected === emptyKeyForAllList) {
                        return true;
                    }
                    return actual && (actual + '').toLowerCase().indexOf(expected.toLowerCase()) > -1;
                };
            }
        };
    });
