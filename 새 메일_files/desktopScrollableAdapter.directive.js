(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('desktopScrollableAdapter', DesktopScrollableAdapter);

    /* @ngInject */
    function DesktopScrollableAdapter($parse, deviceDetector, BROWSERS, EMIT_EVENTS, scrollableConfig, _) {
        scrollableConfig.template = '<div class="{nanoClass}" ng-transclude></div>';
        var isDesktop = deviceDetector.isDesktop();
        return {
            restrict: 'A',
            scope: false,
            terminal: true,
            transclude: true,
            templateUrl: function (element, attrs) {
                if (attrs.withoutStatic) {
                    return isDesktop ? 'modules/components/desktopScrollableAdapter/desktopScrollableAdapter.html' :
                        'modules/components/desktopScrollableAdapter/desktopScrollableAdapter.mobile.html';
                }

                return isDesktop ? 'modules/components/desktopScrollableAdapter/desktopScrollableAdapter.static.html' :
                    'modules/components/desktopScrollableAdapter/desktopScrollableAdapter.static.mobile.html';
            },
            priority: 500,
            compile: function CompilingFunction($tElement, $tAttr) {
                return {
                    pre: function PreFunction($scope) {
                        $scope.tabIndex = deviceDetector.browser === BROWSERS.FIREFOX ? -1 : 0;
                    },
                    post: function PostFunction($scope, $element, attr) {
                        if (!deviceDetector.isDesktop()) {
                            return;
                        }

                        var scrollPositionForRestore = 0;
                        var nano$ = $element.find('.nano'),
                            nanoContent$ = nano$.find('.nano-content');

                        //윈도우의 브라우저에서 자주 발생되는 현상으로 레이어 스크롤의 넓이가 레이어 영향을 미치는 브라우저에 대한 예외처리
                        nanoContent$.addClass('scroll-y');
                        nano$.nanoScroller();

                        nano$.on('update', function (event, values) {
                            scrollPositionForRestore = _.get(values, 'position');
                        });

                        var restoreScrollPosition = _.debounce(function restoreScrollPosition() {
                            nano$.nanoScroller();
                            nano$.nanoScroller({scrollTop: scrollPositionForRestore});
                        }, 200);

                        var debounceOnDomRendered = _.debounce(function () {
                            restoreScrollPosition();
                        }, 200);

                        var detachEventListener = $scope.$on(EMIT_EVENTS.CUSTOM_DOM_RENDERED, debounceOnDomRendered);

                        var restoreScrollWhenHandler = angular.noop;
                        if (attr.restoreScrollWhen) {
                            restoreScrollWhenHandler = $scope.$watch($parse($tAttr.restoreScrollWhen), function (newVal) {
                                if (newVal) {
                                    restoreScrollPosition();
                                }
                            });
                        }
                        var resetScrollWhenWhenHandler = angular.noop;
                        if (attr.resetScrollWhen) {
                            resetScrollWhenWhenHandler = $scope.$watch($parse($tAttr.resetScrollWhen), function (/*newVal, oldVal*/) {
                                scrollPositionForRestore = 0;
                                restoreScrollPosition();
                            });
                        }

                        $scope.$on('$destroy', function () {
                            detachEventListener();
                            restoreScrollPosition.cancel();
                            debounceOnDomRendered.cancel();
                            restoreScrollWhenHandler();
                            resetScrollWhenWhenHandler();
                            nano$.nanoScroller({destroy: true});
                            nano$.off('update');
                        });
                    }
                };
            }
        };
    }

})();
