(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('doorayInfiniteScroll', DoorayInfiniteScroll);

    /* @ngInject */
    function DoorayInfiniteScroll($timeout, _) {
        return {
            restrict: 'A',
            priority: 0,
            scope: {
                direction: '@',
                scrollThreshold: '@',
                targetElementSelector: '@',
                onScroll: '&',
                handler: '&doorayInfiniteScroll',
                resetScrollWhen: '=',
                enablePreventScrollBottom: '&',
                delay: '@'
            },
            link: linkFunc
        };

        function linkFunc(scope, element) {
            var lengthThreshold = _.parseInt(scope.scrollThreshold, 10) || 50,
                lastScrolled = -9999,
                targetElemnt$,
                debounceScrollHandler;

            $timeout(function () {
                targetElemnt$ = scope.targetElementSelector ? element.find(scope.targetElementSelector) : element;
                debounceScrollHandler = _.debounce(scrollHandler, scope.delay || 10);
                targetElemnt$.on('scroll', debounceScrollHandler);

                if (scope.direction === 'reverse') {
                    $timeout(function () {
                        targetElemnt$[0].scrollTop = targetElemnt$[0].clientHeight;
                    }, 0, false);
                }

                scope.$on('$destroy', function () {
                    targetElemnt$.off('scroll', debounceScrollHandler);
                    targetElemnt$ = null;
                });
            }, 0, false);

            scope.handler = _.isFunction(scope.handler) ? scope.handler : angular.noop;

            function scrollHandler() {
                scope.onScroll();
                var scrolled = targetElemnt$[0].scrollTop;

                if (isInScrollThreshold(scrolled)) {
                    scope.$apply(scope.handler);
                }

                lastScrolled = scrolled;
            }

            function isInScrollThreshold(scrolled) {
                var scrollHeight = targetElemnt$[0].scrollHeight,
                    outerHeight = targetElemnt$.outerHeight();

                var remainScroll = scrollHeight - (outerHeight + scrolled);
                //if (scope.enablePreventScrollBottom() && remainScroll === 0) {
                //    // 무한히 로딩하는 현상을 막기 위한 코드
                //    targetElemnt$.scrollTop(scrolled - 40);
                //}

                return (remainScroll <= lengthThreshold) && ((scrolled - lastScrolled) > 0);
            }
        }
    }

})();
