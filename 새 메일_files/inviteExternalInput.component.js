(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .component('inviteExternalInput', {
            templateUrl: 'modules/setting/common/invitation/userInvitation/inviteExternalInput/inviteExternalInput.html',
            controller: InviteExternalInput,
            bindings: {
                externalList: '=',
                inviteeRole: '=',
                locale: '=',
                invitableRoles: '<'
            }
        });

    /* @ngInject */
    function InviteExternalInput($q, $scope, HelperLocaleUtil, MessageModalFactory, TagInputMailHelper, TagInputTaskHelper, gettextCatalog, _) {
        var $ctrl = this;

        $scope._ = _;
        $ctrl.allowTag = TagInputMailHelper.allowEmailUser;
        $ctrl.onSelectMember = onSelectMember;
        $ctrl.changeInviteeRole = changeInviteeRole;
        $ctrl.locales = _.filter(HelperLocaleUtil.getLanguageList(), function (locale) {
            return locale.code !== 'zh_CN';
        });

        function onSelectMember(item, list) {
            var emailAddress = _.get(item, 'emailUser.emailAddress');
            TagInputTaskHelper.queryMemberOrGroup(emailAddress, {field: 'emailAddress', typeList: ['member']}).then(function (members) {
                return _confirmDuplicatedMember(members, emailAddress, '<p>이미 추가된 사용자입니다.</p>');
            }).then(function () {
                list.splice(list.length - 1, 1);
            });
        }

        function changeInviteeRole(role) {
            $ctrl.inviteeRole = role;
        }

        function _confirmDuplicatedMember(members, emailAddress) {
            var duplicatedMember = _.find(members, function (member) {
                return member[member.type].emailAddress ===  emailAddress;
            }), alertMsg = gettextCatalog.getString('<p>이미 추가된 사용자입니다.</p>');
            return duplicatedMember ? MessageModalFactory.alert(alertMsg).result : $q.reject();
        }

    }

})();
