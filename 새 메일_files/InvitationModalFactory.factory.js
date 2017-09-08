(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .factory('InvitationModalFactory', InvitationModalFactory);

    /* @ngInject */
    function InvitationModalFactory($q, $uibModal, ProjectMemberBiz) {
        return {
            // option = {projectCode: 'aa', projectMembers: [], organizationId: 'me'}
            open: function (option) {
                option = option || {};
                if (!option.projectCode && !option.organizationId) {
                    return $q.reject();
                }

                return $uibModal.open({
                    'template': '<user-invitation $uib-modal-instance="$ctrl.$uibModalInstance" project-code="$ctrl.projectCode" organization-id="$ctrl.organizationId" project-members="$ctrl.projectMembers"></user-invitation>',
                    'windowClass': 'setting-modal project-member-invite dooray-setting-content',
                    'controllerAs': '$ctrl',
                    /* @ngInject */
                    'controller': function ($uibModalInstance) {
                        var $ctrl = this;
                        $ctrl.$uibModalInstance = $uibModalInstance;
                        $ctrl.projectCode = option.projectCode;
                        $ctrl.projectMembers = option.projectCode && option.projectMembers;
                        $ctrl.organizationId = option.organizationId;
                        if (option.projectCode && $ctrl.projectMembers) {
                            ProjectMemberBiz.fetchList({projectCode: option.projectCode}).then(function (result) {
                                $ctrl.projectMembers = result.contents();
                            });
                        }
                    }
                });
            },
            confirm: function (inviteResult, internalMemberList) {
                return $uibModal.open({
                    'template': '<invitation-result $uib-modal-instance="$ctrl.$uibModalInstance" invite-result="$ctrl.inviteResult" internal-member-list="$ctrl.internalMemberList"></invitation-result>',
                    'windowClass': 'setting-modal project-member-invite-confirm dooray-setting-content',
                    'controllerAs': '$ctrl',
                    /* @ngInject */
                    'controller': function ($uibModalInstance) {
                        this.$uibModalInstance = $uibModalInstance;
                        this.inviteResult = inviteResult;
                        this.internalMemberList = internalMemberList;
                    }
                });
            }
        };
    }

})();
