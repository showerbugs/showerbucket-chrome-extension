(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .factory('RootScopeEventBindHelper', RootScopeEventBindHelper);

    /* @ngInject */
    function RootScopeEventBindHelper($rootScope) {
        return {
            emit: function (/* name, ...params */) {
                $rootScope.$emit.apply($rootScope, arguments);
            },
            on: function ($scope/*, name, ...params*/) {
                var args = Array.prototype.slice.call(arguments, 1),
                    unsubscribe = $rootScope.$on.apply($rootScope, args),
                    unsubscribeDestroy = $scope && $scope.$on('$destroy', unsubscribe);
                return function () {
                    unsubscribe();
                    unsubscribeDestroy();
                };
            },
            withScope: function ($scope) {
                return {
                    on: function (/* name, ...params */) {
                        var unsubscribe = $rootScope.$on.apply($rootScope, arguments);
                        $scope && $scope.$on('$destroy', unsubscribe);
                        return this;
                    }
                };
            }
        };
    }

})();
