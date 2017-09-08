(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .controller('ColumnSelectBoxCtrl', ColumnSelectBoxCtrl);

    /* @ngInject */
    function ColumnSelectBoxCtrl($scope, $state, FullViewBoxItemsBiz) {
        var self = this;
        this.isShowColumnPane = false;
        this.multiSelectMetaData = FullViewBoxItemsBiz.multiSelectMetaData;

        // multiselect 관련 메소드
        this.openColumnPane = openColumnPane;
        this.onCloseColumnPane = onCloseColumnPane;
        this.selectColumnItem = selectColumnItem;

        _fetchColumnList();

        $scope.$on('$stateChangeSuccess', function () {
           if (!$state.includes('**.view')) {
               _fetchColumnList();
           }
        });

        function openColumnPane() {
            self.isShowColumnPane = true;
        }

        function onCloseColumnPane() {
            self.isShowColumnPane = false;
        }

        function selectColumnItem(item) {
            FullViewBoxItemsBiz.selectColumnItem(item, self.columnList);
        }

        function _fetchColumnList() {
            self.columnList = FullViewBoxItemsBiz.getSelectableOptionList();
        }
    }

})();
