(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .factory('HelperFormUtil', HelperFormUtil);

    /* @ngInject */
    function HelperFormUtil() {
        return {
            bindService: function ($scope, formName) {
                var self = this;
                $scope.hasError = function (name) { return self.hasError($scope, formName, name); };
                $scope.getMessage = function (name) { return self.getMessage($scope, formName, name); };
            },

            checkInvaild: function (formController) {
                if (!formController){ return false; }
                return formController.$invalid || formController.$pending;
            },

            reset: function (formController) {
                if (!formController){ return; }
                _.result(formController, '$setPristine');
                _.result(formController, '$setUntouched');
                _.result(formController, '$rollbackViewValue');
            },

            hasError: function ($scope, formName, name) {
                if (!$scope[formName] || !$scope[formName][name]){ return false; }
                return $scope[formName][name].$invalid && ($scope[formName].$submitted || $scope[formName][name].$dirty);
            },

            getMessage: function ($scope, formName, name) {
                if (!$scope[formName] || !$scope[formName][name]){ return false; }
                return $scope[formName][name].$error;
            }
        };
    }

})();
