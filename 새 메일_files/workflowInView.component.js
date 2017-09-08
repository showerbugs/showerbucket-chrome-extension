(function () {

    'use strict';

    angular
        .module('doorayWebApp')
        .component('workflowInView', {
            templateUrl: 'modules/project/view/component/workflowInView/workflowInView.html',
            controller: WorkflowInView,
            bindings: {
                'post': '<',
                'workflows': '<',
                'onChangeWorkflow': '&',
                'fetchedAt': '&'
            }
        });

    /* @ngInject */
    function WorkflowInView($scope, $element, $document, TaskWorkflowService, _) {
        var $ctrl = this;

        var SORT_ORDER = {
            registered: '1',
            working: '2',
            closed: '3'
        };
        $ctrl.ui = {
            panel: false
        };
        $ctrl.workflow = {};
        $ctrl.workflowMemberList = [];

        $ctrl.convertWorkflowToName = TaskWorkflowService.convertWorkflowToName;
        $ctrl.toggleStatusPanel = toggleStatusPanel;
        $ctrl.changeWorkflow = changeWorkflow;
        $ctrl.isAllMemberClosed = isAllMemberClosed;

        //PreDefined Callback;

        this.$onInit = function () {
        };

        this.$onChanges = function (changes) {
            $ctrl.memberList = $ctrl.post.users.to;

            if(changes.workflows) {
                $ctrl.workflow.closed = null;
                $ctrl.workflow.working = null;

                _.forEach($ctrl.workflows, function (workflow) {
                    // find first one
                    if ($ctrl.workflow.closed === null && workflow.class === 'closed') {
                        $ctrl.workflow.closed = workflow;
                    }
                    // find last one
                    if (workflow.class === 'working') {
                        $ctrl.workflow.working = workflow;
                    }

                    if (workflow.class === 'registered') {
                        $ctrl.workflow.registered = workflow;
                    }
                });
            }
        };

        this.$onDestroy = function () {
        };

        $scope.$on('$destroy', function () {
            $document.unbind('click', closeStatusPanel);
        });

        function toggleStatusPanel(event) {
            if ($ctrl.ui.panel) {
                closeStatusPanel();
            } else {
                openStatusPanel();
            }
            event.stopPropagation();
        }

        function openStatusPanel() {
            $ctrl.ui.panel = true;
            makeWorkflowMemberMap();
            $document.bind('click', closeStatusPanel);
        }

        function makeWorkflowMemberMap() {
            $ctrl.workflowMemberList = _($ctrl.memberList)
                .map(function (memberOrGroup) {
                    if (memberOrGroup.type !== 'group') {
                        return memberOrGroup;
                    }
                    return memberOrGroup.group.members;
                })
                .flatten()
                .uniqWith(function (user, otherUser) {
                    return user.type === otherUser.type &&
                        (user.type === 'member' ?
                        user.member.id === otherUser.member.id :
                        user.emailUser.emailAddress === otherUser.emailUser.emailAddress);
                })
                .sortBy(function (user) {
                    return SORT_ORDER[user._workflowClass] + user._displayName;
                }).value();
        }

        function closeStatusPanel(event) {
            if (isInMouse(event)) {
                return;
            }
            $ctrl.ui.panel = false;
            $document.unbind('click', closeStatusPanel);

            if (_.isUndefined(event)) {
                return;
            }
            //    상태 변경 element가 아닌 다른 곳을 클릭했을때
            //    diegset를 해주지 않으면 모델값은 변경되지만 모델값을 보고 ng-show를 해주는 마크업에 변경된 모델값이 반영되지 않음.
            $scope.$digest();
        }

        function changeToCloseAllWorkflow() {
            if (_.isEmpty($ctrl.workflowMemberList)) {
                return;
            }
            _.forEach($ctrl.workflowMemberList, function (user) {
                user._workflowClass = 'closed';
            });
            $ctrl.workflowMemberList.splice(0, 1, _.clone($ctrl.workflowMemberList[0]));
            $ctrl.onChangeWorkflow({
                target: '*',
                workflowId: $ctrl.workflow.closed.id
            });
        }

        function changeWorkflow(user, workflowClass, index) {
            if (user === '*') {
                changeToCloseAllWorkflow();
                return;
            }
            _.set(user, '_workflowClass', workflowClass);
            $ctrl.workflowMemberList.splice(index, 1, _.clone(user));

            $ctrl.onChangeWorkflow({
                target: user.type === 'member' ? user.member.id : user.emailUser.emailAddress,
                workflowId: $ctrl.workflow[workflowClass].id
            });
        }

        function isAllMemberClosed() {
            return _.every($ctrl.memberList, function (user) {
                return user._workflowClass === 'closed';
            });
        }

        function isInMouse(event) {
            if (_.isUndefined(event)) {
                return false;
            }

            var mouseX = event.pageX,
                mouseY = event.pageY,
                statusPanel$ = $element.find('.status-panel');

            if (!statusPanel$.length) {
                return false;
            }

            var panelPosition = statusPanel$[0].getBoundingClientRect();

            if (mouseX >= panelPosition.left && mouseX <= panelPosition.right &&
                mouseY >= panelPosition.top && mouseY <= panelPosition.bottom) {
                return true;
            } else {
                return false;
            }
        }

    }

})();
