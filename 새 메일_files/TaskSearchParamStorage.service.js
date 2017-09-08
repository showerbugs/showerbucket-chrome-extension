(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .service('TaskSearchParamStorage', TaskSearchParamStorage);

    /* @ngInject */
    function TaskSearchParamStorage($state, localStorage, TASK_SEARCH_PARAM_STORAGE_VERSION, StateParamsUtil, _) {
        return {
            getStoredFilter: getStoredFilter,
            save: save
        };

        function getStoredFilter() {
            return $state.params.filterStoreMode ? getAndCheckVersion() : {};
        }

        function save(_params) {
            var params = {},
                candidatesForSave = ['milestone', 'tags', 'order', 'to', 'cc', 'from', 'dueDate', 'userWorkflowClass', 'postWorkflowClass'];
            if (!$state.params.filterStoreMode) {
                return;
            }

            _.forEach(candidatesForSave, function(paramKey) {
                // null이면 저장 안함
                if (_params[paramKey]) {
                    params[paramKey] = _params[paramKey];
                }
            });
            params.version = TASK_SEARCH_PARAM_STORAGE_VERSION;
            localStorage.setItem(StateParamsUtil.getFilterUniqueKey(), angular.toJson(params));
        }

        function getAndCheckVersion() {
            var paramString = localStorage.getItem(StateParamsUtil.getFilterUniqueKey()),
                params = angular.fromJson(paramString) || {};
            if (params.version !== TASK_SEARCH_PARAM_STORAGE_VERSION && paramString) {
                localStorage.removeItem(StateParamsUtil.getFilterUniqueKey());
                return {};
            }
            delete params.version;

            return params;
        }
    }

})();
