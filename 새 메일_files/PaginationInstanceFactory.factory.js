(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .constant('PAGINATION_KEYS', {
            COMMON_LIST: 'COMMON_LIST' // 공통된 리스트
        })
        .factory('PaginationInstanceFactory', PaginationInstanceFactory);

    /* @ngInject */
    function PaginationInstanceFactory(API_PAGE_SIZE, PAGINATION_KEYS, _) {
        var instances = {};

        var Pagination = angular.element.inherit({
            __constructor: function () {
                this.limitSize = API_PAGE_SIZE.DEFAULT;
                this.currentPageNum = 1;
                this.lastPageNum = 5;
                this.totalCnt = 0;
            },
            init: function (limitSize, currentPageNum, totalCnt) {
                currentPageNum = _.isNumber(currentPageNum) ? currentPageNum : 1;

                // 리스트 갱신할 때 페이지 숫자가 변하지 않아서 version정보 추가
                this.version = this.version ? this.version + 1 : 1;
                this.limitSize = limitSize;
                this.currentPageNum = Math.max(1, currentPageNum);
                this.totalCnt = 0;
                if (!_.isUndefined(totalCnt)) {
                    this.setLastPageUsingTotalCnt(totalCnt);
                }
            },
            moveNextPage: function () {
                this.currentPageNum = Math.min(this.currentPageNum + 1, this.lastPageNum);
                return this.currentPageNum;
            },
            movePrevPage: function () {
                this.currentPageNum = Math.max(this.currentPageNum - 1 , 1);
                return this.currentPageNum;
            },
            moveFirstPage: function () {
                this.currentPageNum = 1;
                return this.currentPageNum;
            },
            moveLastPage: function () {
                this.currentPageNum = this.lastPageNum;
                return this.currentPageNum;
            },
            movePageNum: function (pageNum) {
                this.currentPageNum = pageNum;
                return this.currentPageNum;
            },
            hasNextPage: function () {
                return this.currentPageNum < this.lastPageNum;
            },
            hasPrevPage: function () {
                return this.currentPageNum > 1;
            },
            getCurrentPageNum: function () {
                return this.currentPageNum;
            },
            setLastPageUsingTotalCnt: function (totalCnt) {
                this.totalCnt = totalCnt;
                this.lastPageNum = Math.ceil(totalCnt / this.limitSize);
                this.currentPageNum = totalCnt ? this.currentPageNum : 1;
            },
            getLastPage: function () {
                return this.lastPageNum;
            },
            getLimitSize: function () {
                return this.limitSize;
            },
            getTotalCount: function () {
                return this.totalCnt;
            },
            getParam: function () {
                return {
                    size: this.limitSize,
                    page: this.currentPageNum - 1
                };
            }
        });

        return {
            getOrMakePagination: function (key) {
                instances[key] = instances[key] || new Pagination();
                return instances[key];
            },
            getOrMakeCommonListPagination: function () {
                return this.getOrMakePagination(PAGINATION_KEYS.COMMON_LIST);
            }
        };
    }

})();
