(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .component('invitationResult', {
            templateUrl: 'modules/setting/common/invitation/invitationResult/invitationResult.html',
            controller: InvitationResult,
            bindings: {
                $uibModalInstance: '<',
                inviteResult: '<',
                internalMemberList: '<'
            }
        });

    /* @ngInject */
    function InvitationResult(HelperAddressUtil, gettextCatalog, _) {
        var $ctrl = this;
        var resultString = [
            {
                string: gettextCatalog.getString('초대를 완료하였습니다.'),
                class: 'success-fully'
            },
            {
                string: gettextCatalog.getString('초대가 실패되었습니다.'),
                class: 'failure'
            },
            {
                string: gettextCatalog.getString('일부 초대가 실패되었습니다.'),
                class: 'success-partially'
            }
        ];

        $ctrl.inviteeList = {
            internal: [],
            external: []
        };

        $ctrl.close = function () {
            $ctrl.$uibModalInstance.dismiss();
        };

        $ctrl.openInvite = function () {
            $ctrl.$uibModalInstance.close();
        };

        $ctrl.inviteeList.internal = getInvitedInternalMembers();
        $ctrl.inviteeList.external = $ctrl.inviteResult.external;
        $ctrl.getDisplayNameForInternalMember = getDisplayNameForInternalMember;
        var resultCount = getInviteResultCount();
        $ctrl.successCount = resultCount.true;
        $ctrl.failureCount = resultCount.false;
        $ctrl.resultDescription = getDescription();

        function getDisplayNameForInternalMember(member) {
            return HelperAddressUtil.makeDisplayInMail(member.name, member.emailAddress);
        }

        function getDescription() {
            if ($ctrl.failureCount === 0 || !$ctrl.failureCount) {
                return resultString[0];
            }
            return $ctrl.successCount === 0 ? resultString[1] : resultString[2];
        }

        function getInviteResultCount() {
            return _($ctrl.inviteResult).values().flatten().countBy({status: 'success'}).value();
        }

        function getInvitedInternalMembers() {
            return _($ctrl.inviteResult.internal).filter({'status': 'success'}).map(function (invitee) {
                return _.find($ctrl.internalMemberList, function (member) {
                    return member.id === invitee.memberId;
                });
            }).value();
        }
    }

})();
