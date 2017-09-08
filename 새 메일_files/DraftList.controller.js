(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .controller('DraftListCtrl', DraftListCtrl);

    /* @ngInject */
    function DraftListCtrl($scope, $state, ITEM_TYPE, ApiPageSizeFactory, ListActionButtonBiz, NoticeSummaryService, CommonItemList, MessageModalFactory, ListCheckBoxBiz, gettextCatalog) {
        var init = function () {
            ListCheckBoxBiz.init();
            CommonItemList.init();
            NoticeSummaryService.resetMessage();
            $scope.commonList.pagination.init(ApiPageSizeFactory.getListApiSize(), $state.params.page || 1);
            CommonItemList.fetchList().then(function () {
                // view state에서만 실행
                if ($state.includes('**.view')) {
                    $scope.commonList.scrollToSelectedItem();
                }
            });
        };

        $scope.listActionButton = (function () {
            return {
                action: {
                    removeDrafts: function () {
                        ListActionButtonBiz.removeDrafts(ITEM_TYPE.POST);
                    }
                },
                uiModel: {
                    hasCheckedItem: false
                }
            };
        })();

        $scope.$watch(ListCheckBoxBiz.getItemsSize, function (newVal) {
            $scope.listActionButton.uiModel.hasCheckedItem = newVal;
        });

        $scope.showAlert = function () {
            MessageModalFactory.alert(gettextCatalog.getString('준비 중입니다.'));
        };

        $scope.selectItem = function (task) {
            $scope.commonList.markSelectedItem(task.id);
        };

        $scope.calcAllToMembers = function (post) {
            return _(post.users.to)
                .map(function (memberOrGroup) {
                    return memberOrGroup.type !== 'group' ?
                        memberOrGroup : memberOrGroup.group.members;
                })
                .flatten()
                .uniqBy('member.id').value().length;
        };

        // main list가 변경되면 그 값을 보여줍니다.
        $scope.$watch(CommonItemList.getLoading, function (val) {
            $scope.loading = val;
            if (val) {
                ListCheckBoxBiz.init();
            } else {
                $scope.items = CommonItemList.getItems();
                if ($state.includes('**.view')) {
                    $scope.commonList.markSelectedItem();
                }
            }
        });

        $scope.$on('$destroy', function () {
            CommonItemList.cancelFetchList();
        });

        $scope.$on('$stateChangeSuccess', function () {
            if ($state.includes('**.view')) {
                return;
            }

            init();
        });

        if ($state.includes('**.view')) {
            init();
        }
    }

})();
