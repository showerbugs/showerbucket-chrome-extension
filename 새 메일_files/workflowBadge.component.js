(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .component('workflowBadge', {
            templateUrl: 'modules/components/workflowBadge/workflowBadge.html',
            controller: WorkflowBadge,
            bindings: {
                post: '<',
                fetchedAt: '<',
                isMyWorkflowPost: '@'
            }
        });

    /* @ngInject */
    function WorkflowBadge(DateConvertUtil, TaskWorkflowService, gettextCatalog, _) {
        var $ctrl = this;

        this.uiVersion = 1;

        this.$onChanges = function (changes) {
            $ctrl.isMyWorkflowPost = !!angular.fromJson($ctrl.isMyWorkflowPost);

            if (_.isEmpty($ctrl.post)) {
                return;
            }
            fetchValues($ctrl.post, $ctrl.isMyWorkflowPost);

            if (!_.result(changes, 'post.isFirstChange')) {
                $ctrl.uiVersion += 1;
            }
        };

        function fetchValues(post, isMyWorkflowPost) {
            if (!post.dueDateFlag) {
                return;
            }
            var workflowClass = TaskWorkflowService.getWorkflowClass(post, isMyWorkflowPost);
            $ctrl.name = TaskWorkflowService.convertWorkflowToName(workflowClass);
            $ctrl.name += (hasDuedate(post, workflowClass) && DateConvertUtil.isOverDate(post.dueDate)) ? '/' + gettextCatalog.getString('지연') : '';
        }

        function hasDuedate(post, workflowClass) {
            return workflowClass !== 'closed' && !_.isEmpty(post.dueDate) && post.dueDateFlag;
        }
    }

})();
