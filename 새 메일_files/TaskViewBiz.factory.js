(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TaskViewBiz', TaskViewBiz);

    /* @ngInject */
    function TaskViewBiz(TaskResource, TaskToResource) {
        return {
            update: update,
            changeWorkflow: changeWorkflow
        };

        function update(projectCode, postNumber, params) {
            return TaskResource.update({
                'projectCode': projectCode,
                'postNumber': postNumber
            }, params).$promise;
        }

        function changeWorkflow(params, workflowId) {
            return TaskToResource.update(params, {
                'workflowId': workflowId
            }).$promise;
        }
    }

})();
