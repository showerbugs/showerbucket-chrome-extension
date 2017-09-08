(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TaskListBiz', TaskListBiz);

    /* @ngInject */
    function TaskListBiz(ApiPageSizeFactory, PaginationInstanceFactory, TaskDraftResource, TaskResource, TaskSearchResource, TaskDisplayHelperFactory, _) {
        return {
            //params = { projectCode : "*"[, postNumber : ""] }
            fetchList: fetchTaskList,
            fetchTaskInList: fetchTaskInList,
            getPromise: getPromise,
            getDraftList: fetchDraftList,
            fetchListBySearch: fetchListBySearch,
            fetchListBySearchV2: fetchListBySearchV2,
            completeList: completeList,
            saveSimpleNewPost: saveSimpleNewPost
        };

        function fetchTaskList(params) {
            var resource = TaskResource.get(params);
            return {
                'resource': resource,
                '$promise': resource.$promise.then(function (result) {
                    _.forEach(result.contents(), function (item) {
                        TaskDisplayHelperFactory.assignDisplayPropertiesInList(item);
                    });
                    if (!params.pinned) {
                        PaginationInstanceFactory.getOrMakeCommonListPagination()
                            .init(ApiPageSizeFactory.getListApiSize(), (params.page || 0) + 1, result.totalCount());
                    }

                    return result;
                })
            };
        }

        function fetchTaskInList(params) {
            var resource = TaskResource.get(params);
            return {
                'resource': resource,
                '$promise': resource.$promise.then(function (result) {
                    TaskDisplayHelperFactory.assignDisplayPropertiesInList(result.contents());

                    return result;
                })
            };
        }

        function fetchDraftList(params) {
            var resource = TaskDraftResource.get(params);

            return {
                'resource': resource,
                '$promise': resource.$promise.then(function (result) {
                    _.forEach(result.contents(), function (item) {
                        new TaskDisplayHelperFactory.AssignDisplayPropertiesBuilder(item)
                            .withMemberGroupFilter()
                            .withDueDateString()
                            .withUpdatedAtSimpleFormat()
                            .withApplyColorToTags()
                            .withCopyProps()
                            .withResetFetchedAt()
                            .build();
                    });
                    PaginationInstanceFactory.getOrMakeCommonListPagination()
                        .init(ApiPageSizeFactory.getListApiSize(), params.page + 1, result.totalCount());
                    return result;
                })
            };
        }

        function completeList(params) {
            return TaskResource.complete(params).$promise;
        }

        function saveSimpleNewPost(params, body) {
            return TaskResource.simpleSave(params, body).$promise;
        }

        function getPromise(params) {
            return TaskResource.get(params).$promise;
        }

        function fetchListBySearch(params){
            return TaskSearchResource.search(params).$promise;
        }

        function fetchListBySearchV2(params) {
            return TaskSearchResource.searchV2(params).$promise;
        }
    }

})();
