(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .service('NoticeTaskList', NoticeTaskList);

    /* @ngInject */
    function NoticeTaskList($state, PROJECT_STATE_NAMES, StateParamsUtil, TaskListBiz, _) {
        var noticeTasks = [],
            loading = false,
            currentParams = {};

        return {
            getLoading: getLoading,
            getItems: getItems,
            replaceItem: replaceItem,
            applyFunction: applyFunction,
            fetchList: fetchList
        };

        function getLoading() {
            return loading;
        }

        function getItems() {
            return noticeTasks;
        }

        function editListItem(id, callback) {
            var targetIndex = _.findIndex(noticeTasks, {'id': id});

            if (targetIndex < 0) {
                return;
            }

            noticeTasks.splice(targetIndex, 1, callback(noticeTasks[targetIndex]));
        }

        function replaceItem(item) {
            editListItem(item.id, function () {
                return item;
            });
        }

        function applyFunction(id, callback) {
            editListItem(id, function (target) {
                var clone = _.clone(target);
                callback(clone);
                return clone;
            });
        }

        function makeParams(params) {
            if (params) {
                currentParams = {
                    projectCode: params.projectCode,
                    order: params.order,
                    pinned: true
                };
            }

            return currentParams;
        }

        function fetchList(params) {
            if (!$state.includes(PROJECT_STATE_NAMES.PROJECT_BOX) ||
                $state.params.page > 1) {
                noticeTasks.length = 0;
                return;
            }

            var _params = makeParams(params);

            loading = true;

            return TaskListBiz.fetchList(_params).$promise.then(function (result) {
                if (_params.projectCode !== StateParamsUtil.getProjectCodeFilter()) {
                    noticeTasks.length = 0;
                    return [];
                }

                noticeTasks = result.contents();
                return noticeTasks;
            }).finally(function () {
                loading = false;
            });
        }
    }

})();
