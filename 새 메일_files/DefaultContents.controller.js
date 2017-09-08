(function () {

    'use strict';

    angular
        .module('doorayWebApp.layout')
        .controller('DefaultContentsCtrl', DefaultContentsCtrl);

    /* @ngInject */
    function DefaultContentsCtrl($scope, $state, PROJECT_STATE_NAMES, CommonItemList, ListCheckBoxBiz, PaginationInstanceFactory, ViewModeBiz) {
        var self = this;
        var pagination = PaginationInstanceFactory.getOrMakeCommonListPagination();

        self.isShowCheckStatus = false;
        self.isTaskState = $state.includes(PROJECT_STATE_NAMES.PROJECT_STATE);
        self.viewMode = ViewModeBiz.get();
        self.VIEW_MODE = ViewModeBiz.VIEW_MODE;

        // ------- declare method -------

        self.toggleCheckBox = toggleCheckBox;
        self.toggleCheckAll = toggleCheckAll;
        self.getCheckedItemSize = getCheckedItemSize;
        self.isCheckedAll = isCheckedAll;
        self.checkSelectedItem = checkSelectedItem;
        self.resetCheckedList = resetCheckedList;
        self.changeViewMode = changeViewMode;
        self.showRightTopBtn = showRightTopBtn;

        // ------- define method -------

        function showCheckActionView() {
            self.isShowCheckStatus = $scope.taskContentsCtrl && $scope.taskContentsCtrl.isArchivedProject ? false : ListCheckBoxBiz.getItemsSize() > 1;
        }

        function toggleCheckBox(item, $event) {
            if ($event) {
                $event.preventDefault();
            }
            ListCheckBoxBiz.toggleItem(item);
            showCheckActionView();
        }

        function toggleCheckAll() {
            ListCheckBoxBiz.setAllItemsCheckedBy(CommonItemList.getItems(), !self.isCheckedAll());
            showCheckActionView();
        }

        function getCheckedItemSize() {
            return ListCheckBoxBiz.getItemsSize();
        }

        function isCheckedAll() {
            var itemSize = CommonItemList.getItemSize();
            return itemSize > 0 && itemSize === ListCheckBoxBiz.getItemsSize();
        }

        function checkSelectedItem(itemId) {
            var selectedItem = CommonItemList.findItemInListById(itemId);
            resetCheckedList();

            if (selectedItem) {
                ListCheckBoxBiz.toggleItem(selectedItem);
            }
        }

        function resetCheckedList() {
            ListCheckBoxBiz.init();
            self.isShowCheckStatus = false;
        }

        function changeViewMode(mode) {
            if (ViewModeBiz.get() === mode) {
                return;
            }
            ViewModeBiz.set(mode);
            $state.go($state.current.name, {}, {reload: _($state.current.name).split('.').take(3).join('.')});
        }

        function showRightTopBtn() {
            return !$state.current.data.isContentList;
        }

        $scope.$watch(CommonItemList.getLoading, function (newVal) {
            if (newVal) {
                self.isShowCheckStatus = false;
            }
        });

        $scope.$watch(function () {
            return pagination.getTotalCount();
        }, function (newVal) {
            self.totalCount = newVal;
        });
    }

})();
