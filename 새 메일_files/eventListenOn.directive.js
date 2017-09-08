(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .directive('eventListenOn', EventListenOnDirective);

    /* @ngInject */
    function EventListenOnDirective($timeout) {
        return {
            restrict: 'A',
            scope: {
                event: '@eventListenOn',
                listener: '&eventListener',
                target: '@eventListenTarget',
                delay: '@'
            },
            link: postLink
        };

        function postLink(scope, element) {
            $timeout(function () {
                var el$ = element.find(scope.target);
                el$.on(scope.event, function (event) {
                    scope.listener({event: event});
                    scope.$evalAsync();
                });
                el$.on('destroy', function () {
                    el$.off(scope.event);
                });

                scope.$on('$destroy', function () {
                    el$.off(scope.event);
                });
            }, angular.fromJson(scope.delay), false);
        }
    }

})();
