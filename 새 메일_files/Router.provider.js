(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .provider('Router', Router);

    /* @ngInject */
    function Router($stateProvider, $urlRouterProvider) {
        this.$get = ['$state', function ($state) {
            return {
                registerState: registerState,
                getStates: getStates,
                when: when,
                otherwise: otherwise
            };

            function registerState(state) {
                $stateProvider.state(state);
            }

            function when(from, to) {
                if (from && to) {
                    $urlRouterProvider.when(from, to);
                }
            }

            function otherwise(otherwisePath) {
                if (otherwisePath) {
                    $urlRouterProvider.otherwise(otherwisePath);
                }
            }

            function getStates() {
                return $state.get();
            }
        }];
    }


})();
