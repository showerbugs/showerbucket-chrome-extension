(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .controller('TaskSearchListCtrl', TaskSearchListCtrl);

    function TaskSearchListCtrl($scope, $state, $stateParams, $timeout, ApiPageSizeFactory, CommonItemList, DigestService, FileService, PopupUtil, SearchParamConvertUtil, TaskListFilterService, gettextCatalog, _) {
        $scope.defaultResultSize = 5;

        $scope.searchResult = {
            tasks: null,
            totalCount: null,
            searchList: []
        };

        $scope.toggleFilterMenus = function () {
            TaskListFilterService.setShowFilterMenus(!TaskListFilterService.getShowFilterMenus());
            $scope.loading = true;
            $timeout(function () {
                $scope.loading = false;
            }, 0, false);
        };

        function doSearch() {
            var searchParam = SearchParamConvertUtil.toParam($stateParams.query);
            _.forEach(TaskListFilterService.allFilterParamKeys, function (key) {
                searchParam[key] = $stateParams[key];
            });
            searchParam.projectCode = searchParam.projectCode || null;
            searchParam.size = $stateParams.size;
            searchParam.scope = $stateParams.scope || '1';
            searchParam.highlight = true;
            CommonItemList.fetchList(searchParam);
        }

        $scope.isSelectedTask = function (post) {
            var stateParams = $state.params;
            return _.get(post, 'projectCode') === stateParams.projectCode &&
                post.number === stateParams.postNumber &&
                (!stateParams.commentId || _.find(post.events, {'id': stateParams.commentId || null}));
        };

        $scope.$watch(CommonItemList.getTotalCount, function (val) {
            $scope.searchResult.totalCount = val;
        });

        if ($state.current.data.isContentList) {
            $scope.$watch(function () {
                return $state.params;
            }, function (newVal) {
                $scope.stateParams = newVal;
            });
        }

        $scope.$watch(CommonItemList.getLoading, function (val) {
            $scope.loading = val;
            if (!val) {
                $scope.items = CommonItemList.getItems();
                DigestService.safeLocalDigest();

                if ($state.includes('**.view')) {
                    $scope.commonList.markSelectedItem();
                }
            }
        });

        $scope.getFileType = function (mimeType) {
            return FileService.getFileType(mimeType);
        };

        $scope.selectItem = function (task) {
            // 이동하다가 취소할 때 복원하기 위한 데이터
            var backupData = {
                activeId: $scope.commonList.activeId
            };
            $scope.commonList.markSelectedItem(task.id);
            $timeout(function() {
                if (task.projectCode === $state.params.projectCode &&
                    task.number === $state.params.postNumber) {
                    return;
                }
                if (backupData.activeId) {
                    $scope.commonList.markSelectedItem(backupData.activeId);
                }
            }, 200, false);
        };

        $scope.openTaskViewPopup = function (post, $event) {
            PopupUtil.openTaskViewPopup({
                projectCode: post.projectCode,
                postNumber: post.number
            });
            $event.preventDefault();
            $event.stopPropagation();
        };

        function init() {
            $scope.isSearchBox = true;
            $scope.commonList.pagination.init(ApiPageSizeFactory.getListApiSize(), $stateParams.page || 1);
            $scope.noItemMessage = gettextCatalog.getString($state.current.data.noItemMessage);
            CommonItemList.init();

            if (!_.isUndefined($stateParams.query)) {
                doSearch();
            }
        }

        init();


    }
})();



