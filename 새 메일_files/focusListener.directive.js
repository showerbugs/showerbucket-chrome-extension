(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .directive('focusListener', FocusListenerDirective);

    /* @ngInject */
    function FocusListenerDirective($timeout) {
        return {
            restrict: 'A',
            scope: {
                listener: '=focusListener',
                target: '@focusListenTarget',
                delay: '@'
            },
            link: postLink
        };

        function postLink(scope, element) {
            $timeout(function () {
                var el$ = element.find(scope.target);
                el$.on('focus', function () {
                    scope.listener = true;
                    scope.$evalAsync();
                });
                el$.on('blur', function () {
                    scope.listener = false;
                    scope.$evalAsync();
                });
                el$.on('destroy', function () {
                    el$.off('focus').off('blur');
                });

                scope.$on('$destroy', function () {
                    el$.off('focus').off('blur').off('destroy');
                });
            }, angular.fromJson(scope.delay), false);
        }
    }

})();
