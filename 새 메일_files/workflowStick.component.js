(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('workflowStick', {
            templateUrl: 'modules/project/components/workflowStick/workflowStick.html',
            controller: WorkflowStick,
            bindings: {
                post: '<',
                fetchedAt: '<',
                isMyWorkflowPost: '@'
            }
        });

    /* @ngInject */
    function WorkflowStick(DateConvertUtil, TaskWorkflowService, _) {
        var $ctrl = this;
        $ctrl.uiVersion = 1;

        this.$onChanges = function (changes) {
            if (_.isEmpty($ctrl.post)) {
                return;
            }

            _fetchValues();

            if (!_.result(changes, 'post.isFirstChange')) {
                $ctrl.uiVersion += 1;
            }
        };

        function _fetchValues() {
            $ctrl.workflowClass = TaskWorkflowService.getWorkflowClass($ctrl.post, angular.fromJson($ctrl.isMyWorkflowPost));
            $ctrl.isOverDueDate = _.get($ctrl.post, 'dueDate') && DateConvertUtil.isOverDate(_.get($ctrl.post, 'dueDate'));
            $ctrl.isUnplanned = !_.get($ctrl.post, 'dueDate');
        }
    }

})();
