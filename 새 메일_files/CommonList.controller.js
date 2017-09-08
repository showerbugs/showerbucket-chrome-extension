(function () {

    'use strict';

    angular
        .module('doorayWebApp.layout')
        .controller('CommonListCtrl', CommonListCtrl);

    /* @ngInject */
    function CommonListCtrl($scope, $state, ITEM_TYPE, PROJECT_STATE_NAMES, CommonItemList, DetailInstanceFactory, PaginationInstanceFactory, _) {
        var self = this;

        this.scrollToSelectedItem = function () {
            self.focusId = _.get(self.selectedItem, 'data.id');
        };

        this.pagination = PaginationInstanceFactory.getOrMakeCommonListPagination();
        this.afterPaging = function () {
            var params = {'page': self.pagination.getCurrentPageNum()};
            CommonItemList.stateGoWithoutReload('.', params);
        };

        this.markSelectedItem = function (id) {
            id = id || _.get(getSelectedItem(), 'data.id');
            self.activeId = id;
            $scope.defaultContentsCtrl.checkSelectedItem(id);
        };

        function getCurrentStateType() {
            if ($state.includes(PROJECT_STATE_NAMES.PROJECT_STATE)) {
                return ITEM_TYPE.POST;
            }

            return null;
        }

        function getSelectedItem() {
            return DetailInstanceFactory.getOrMakeSelectedItem(getCurrentStateType());
        }

        $scope.$watch('commonList.selectedItem.data.id', function (val) {
            if (val) {
                self.markSelectedItem(val);
            } else if (self.selectedItem && !$state.includes('**.view')) {
                self.focusId = null;
                self.activeId = null;
            }
        });

        $scope.$on('$stateChangeSuccess', function () {
            self.selectedItem = getSelectedItem();
            if (self.selectedItem && !$state.includes('**.view')) {
                self.selectedItem.reset();
            }
        });
    }

})();
