(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('keyNavigatorOnList', KeyNavigatorOnList);

    /* @ngInject */
    function KeyNavigatorOnList($rootScope, $timeout, KEYS, _) {
        return {
            restrict: 'A',
            scope: {
                searchText: '=',
                extendKeyMap: '=',
                loading: '='
            },
            link: function (scope, element) {
                var el$ = {
                    search: null,
                    list: null,
                    focused: null
                };

                var keyMap = {};
                keyMap[KEYS.DOWN] = function () {
                    move(1);
                };
                keyMap[KEYS.UP] = function () {
                    move(-1);
                };
                keyMap[KEYS.TAB] = function () {
                    el$.focused.removeClass('focus');
                    el$.focused.find('a,button,input').focus();
                };
                keyMap[KEYS.ESC] = function () {
                    localSafeApply(resetSearchText);
                };
                keyMap[KEYS.ENTER] = function () {
                    scope.searchText = '';
                    el$.focused.find('a,button,input').click();
                };
                _.assign(keyMap, scope.extendKeyMap);

                var resetSearchText = function () {
                    scope.searchText = '';
                };

                var localSafeApply = function (applyCallback) {
                    if ($rootScope.$$phase) {
                        scope.$evalAsync(applyCallback);
                    } else {
                        scope.$apply(applyCallback);
                    }
                };

                var onKeyDown = _.debounce(function (event) {
                    var action = keyMap[event.which];
                    if (action) {
                        action(el$.focused, scope);
                    }
                }, 10);

                var getNextIndex = function (focusedEl$, direction) {
                    var focusedIndex = el$.list.index(focusedEl$);
                    // 가장 밑에서 아래로 이동했을 때 아무것도 선택안되는 현상을 수정
                    return (focusedIndex + direction) % el$.list.length;
                };

                var move = function (direction) {
                    var focusedEl$ = el$.focused;
                    el$.focused = el$.list.eq(getNextIndex(focusedEl$, direction));

                    focusedEl$.removeClass('focus');
                    el$.focused.addClass('focus');

                    // 스크롤 이동을 위한 코드
                    el$.focused.find('button,a,input').focus();
                    el$.search.focus();
                };

                var initFocus = function (newVal) {
                    // 로딩중일 때 무시
                    if (newVal) {
                        return;
                    }

                    el$.list = element.find('li');
                    el$.list.filter('.focus').removeClass('focus');
                    if (element.find('.focus').length <= 0) {
                        el$.focused = angular.element(el$.list[0]);
                        el$.focused.addClass('focus');
                    }
                };

                var debounceInitFocus = _.debounce(initFocus, 100);

                scope.$watch('loading', debounceInitFocus);

                $timeout(function () {
                    el$.search = element.find('.filter-str,.search-input');
                    el$.search.on('keydown', onKeyDown);
                }, 0, false);

                scope.$on('$destroy', function () {
                    el$.search.off('keydown', onKeyDown);
                });
            }
        };
    }

})();
