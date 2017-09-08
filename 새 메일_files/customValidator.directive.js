(function () {

    'use strict';

    angular
        .module('validation', [])
        .directive('customValidator', CustomValidator);

    /* @ngInject */
    function CustomValidator($log, $q, _) {
        function printError(functionName) {
            $log.log('There is no function with name ' + functionName + ' available on the scope. Please make sure the function exists on current scope or its parent.');
        }

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elm, attr, ngModelCtrl) {
                var validateFunctionNames = attr.validateFunctions && attr.validateFunctions.split(',') || [],
                    remoteValidateFunctionNames = attr.remoteValidateFunctions && attr.remoteValidateFunctions.split(',') || [],
                    validatorNames = attr.customValidator.split(','),
                    index = 0;

                _.forEach(validateFunctionNames, function (functionName) {
                    if (!scope[functionName]) {
                        printError(functionName);
                    } else {
                        ngModelCtrl.$validators[validatorNames[index++]] = function (modelValue, viewValue) {
                            return scope[functionName](viewValue);
                        };
                    }
                });

                _.forEach(remoteValidateFunctionNames, function (functionName) {
                    if (!scope[functionName]) {
                        printError(functionName);
                    } else {
                        ngModelCtrl.$asyncValidators[validatorNames[index++]] = function (modelValue, viewValue) {
                            var def = $q.defer();
                            var result = scope[functionName](viewValue);
                            if (result.then) {
                                result.then(function (data) {
                                    def[data ? 'resolve' : 'reject']();
                                }, function () {
                                    def.reject();
                                });
                            }
                            return def.promise;
                        };
                    }
                });
            }
        };
    }
})();

