(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .service('TaskWorkflowService', TaskWorkflowService);

    /* @ngInject */
    function TaskWorkflowService(gettextCatalog, _) {
        var WORKFLOW_NAME_MAP = {
            registered: gettextCatalog.getString('등록'),
            working: gettextCatalog.getString('진행'),
            closed: gettextCatalog.getString('완료')
        }, WORKFLOW_ACTION_LABEL = {
            working: gettextCatalog.getString('진행하기'),
            closed: gettextCatalog.getString('완료하기')
        };

        return {
            getWorkflowClass: getWorkflowClass,
            convertWorkflowToName: convertWorkflowToName,
            convertWorkflowToActionLabel: convertWorkflowToActionLabel,
            getDisplayWorkflowClass: getDisplayWorkflowClass,
            getMyNextWorkflow: getMyNextWorkflow
        };

        function getWorkflowClass(post, isMyWorkflowPost) {
            return isMyWorkflowPost ? _.get(post._getOrSetProp('myInfo'), '_workflowClass') : post.workflowClass;
        }

        function convertWorkflowToName(workflow) {
            return WORKFLOW_NAME_MAP[workflow];
        }

        function convertWorkflowToActionLabel(workflow) {
            return WORKFLOW_ACTION_LABEL[workflow];
        }

        function getDisplayWorkflowClass(post, isMyWorkflowPost) {
            var workflowClass = getWorkflowClass(post, isMyWorkflowPost);

            if (workflowClass === 'closed' || !post.dueDateFlag) {
                return workflowClass;
            }

            if (!post.dueDate) {
                workflowClass = 'unplanned-' + workflowClass;
            }
            return workflowClass;
        }

        function getMyNextWorkflow(post) {
            var myInfo = _.get(post, 'users.me'),
                workflowMap = post._wrap.refMap.workflowMap();

            if (_.isEmpty(myInfo) || _.isEmpty(myInfo.member.workflowId)) {
                return this;
            }
            var myWorkflow = workflowMap[myInfo.member.workflowId];

            return post.dueDateFlag ? _(workflowMap).filter({'projectId': post.projectId}).sortBy('order').find(function (workflow) {
                return workflow.order > myWorkflow.order;
            }) : null;
        }
    }

})();
