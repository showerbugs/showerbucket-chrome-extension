(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('doorayPagination', DoorayPagination);

    /* @ngInject */
    function DoorayPagination(KEYS) {
        return {
            templateUrl: 'modules/components/doorayPagination/doorayPagination.html',
            restrict: 'E',
            replace: true,
            scope: {
                afterPaging: '&',
                paginationObj: '='
            },
            link: function (scope) {
                var versionWatchHandler, currentNumbWatchHandler;
                scope.ui = {
                    pageNum: 1,
                    hasNoPage: function () {
                        return scope.paginationObj.getLastPage() === 0;
                    },
                    hasPrevPage: function () {
                        return scope.paginationObj.hasPrevPage();
                    },
                    hasNextPage: function () {
                        return scope.paginationObj.hasNextPage();
                    },
                    getLastPage: function () {
                        return scope.paginationObj.getLastPage();
                    }
                };
                var currentPageNum = 1;

                scope.moveNext = moveNext;
                scope.movePrev = movePrev;
                scope.moveFirst = moveFirst;
                scope.moveLast = moveLast;
                scope.onKeydown = onKeydown;

                versionWatchHandler = scope.$watch('paginationObj.version', function () {
                    scope.ui.pageNum = scope.paginationObj.getCurrentPageNum();
                    currentPageNum = scope.ui.pageNum;
                });

                currentNumbWatchHandler = scope.$watch(function () {
                    return scope.paginationObj.getCurrentPageNum();
                }, function (newVal) {
                    if (newVal) {
                        scope.ui.pageNum = newVal;
                    }
                });

                function moveNext() {
                    scope.paginationObj.moveNextPage();
                    _syncPageNum();
                }

                function movePrev() {
                    scope.paginationObj.movePrevPage();
                    _syncPageNum();
                }

                function moveFirst() {
                    scope.paginationObj.moveFirstPage();
                    _syncPageNum();
                }

                function moveLast() {
                    scope.paginationObj.moveLastPage();
                    _syncPageNum();
                }

                function onKeydown(event) {
                    if (event.which === KEYS.ENTER) {
                        _fetchListByPage(scope.ui.pageNum);
                    }
                }

                function _syncPageNum() {
                    scope.ui.pageNum = scope.paginationObj.getCurrentPageNum();
                    _fetchListByPage(scope.ui.pageNum);
                }

                function _fetchListByPage(pageNum) {
                    pageNum = _.parseInt(pageNum, 10);
                    // input박스 모두 지울 때(undefined), 끝페이지 보다 클 때, 같을 때 예외처리
                    if (!pageNum ||
                        currentPageNum === pageNum) {
                        return;
                    }

                    if (pageNum > scope.paginationObj.getLastPage()) {
                        scope.ui.pageNum = scope.paginationObj.getLastPage();
                        _fetchListByPage(scope.ui.pageNum);
                        return;
                    }

                    currentPageNum = pageNum;
                    scope.paginationObj.movePageNum(pageNum);
                    scope.afterPaging();
                }

                scope.$on('$destroy', function () {
                    versionWatchHandler();
                    currentNumbWatchHandler();
                });
            }
        };
    }

})();
