(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .component('inviteInternalInput', {
            templateUrl: 'modules/setting/common/invitation/userInvitation/inviteInternalInput/inviteInternalInput.html',
            controller: InviteInternalInput,
            bindings: {
                internalList: '='
            }
        });

    /* @ngInject */
    function InviteInternalInput($q, $scope, ORG_MEMBER_ROLE, MessageModalFactory, ProjectMemberInvitationRepository, TagInputTaskHelper, gettextCatalog, _) {
        var $ctrl = this;

        $scope._ = _;
        $ctrl.filterMember = filterMember;
        $ctrl.searchMember = searchMember;
        $ctrl.onSelectMember = onSelectMember;
        $ctrl.isAlreadyMember = isAlreadyMember;

        function filterMember(item, listItem) {
            if(!item || !listItem) {
                return false;
            }
            // 현재 선택된 리스트와 중복인 항목은 노출해주지 않습니다
            return item.type === 'emailUser' ? _.get(item, 'emailUser.emailAddress') === _.get(listItem, 'emailUser.emailAddress') :
                _.get(item[item.type], 'id') === _.get(listItem[listItem.type], 'id');
        }

        function searchMember(query) {
            TagInputTaskHelper.queryMemberOrGroup(query, {field: 'all', typeList: ['member', 'group']}).then(function (result) {
                $ctrl.memberList = result;
            });
        }

        function onSelectMember(item, list) {
            if (item.type === 'group') {
                item.group.members = [];
                TagInputTaskHelper.queryProjectMember(item.group).then(function (result) {
                    item.group.members = result;
                });
                return;
            }

            _confirmDuplicatedMember(_.get(item[item.type], 'emailAddress')).then(function () {
                list.splice(list.length - 1, 1);
            });
        }

        function isAlreadyMember(member) {
            return _.includes(ProjectMemberInvitationRepository.getOrgMemberIdList(), member[member.type].id);
        }

        function _confirmDuplicatedMember(emailAddress) {
            var duplicatedMember = _(ProjectMemberInvitationRepository.getList()).map(function (member) {
                return member._wrap.refMap.organizationMemberMap(member.organizationMemberId);
            }).find(function (member) {
                return member.emailAddress ===  emailAddress;
            });
            var alertMsg = gettextCatalog.getString('<p>이미 추가된 사용자입니다.</p>');
            return duplicatedMember ? MessageModalFactory.alert(alertMsg).result : $q.reject();
        }
    }

})();
