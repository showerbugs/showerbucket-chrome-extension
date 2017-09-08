(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .component('userInvitation', {
            /* @ngInject */
            templateUrl: function ($state, ORG_STATE_NAME) {
                return $state.includes(ORG_STATE_NAME) ? 'modules/setting/common/invitation/userInvitation/userInvitation.org.html' :
                    'modules/setting/common/invitation/userInvitation/userInvitation.html';
            },
            controller: UserInvitation,
            bindings: {
                $uibModalInstance: '<',
                projectCode: '<?',
                organizationId: '<?',
                projectMembers: '<?'
            }
        });

    /* @ngInject */
    function UserInvitation($q, $state, API_PAGE_SIZE, ORG_MEMBER_ROLE, ORG_STATE_NAME, HelperLocaleUtil, HelperPromiseUtil, TagInputTaskHelper, InvitationModalFactory, InvitationBiz, MyInfo, MessageModalFactory, PermissionFactory, ProjectMemberBiz, ProjectMemberInvitationRepository, gettextCatalog, _) {
        var $ctrl = this,
            projectCache;
        var promise;

        $ctrl.close = closeModal;
        $ctrl.changeProject = changeProject;
        $ctrl.canInviteExternalMember = canInviteExternalMember;
        $ctrl.setSelectProjectMode = setSelectProjectMode;
        $ctrl.addMember = addMember;

        $ctrl.$onInit = function () {
            var locale = HelperLocaleUtil.defaultLanguage();
            // 전송을 위한 데이터
            $ctrl.form = {
                inviteProject: null,
                inviterName: '',
                locale: locale === 'zh_CN' ? 'en_US' : locale,
                memberInternalList: [],
                memberExternalList: [],
                inviteeRole: ORG_MEMBER_ROLE.MEMBER
            };

            $state.includes(ORG_STATE_NAME) ? _initInOrg() : _init();
            $ctrl.showInvalidMsg = false;
            $ctrl.hasTargetProject = _.isString($ctrl.projectCode);
            if ($ctrl.hasTargetProject) {
                _fetchProjectMembers($ctrl.projectCode);
            }
            _fetchInvitorName();
        };

        function closeModal() {
            $ctrl.$uibModalInstance.dismiss();
        }

        function changeProject(item) {
            _fetchProjectMembers(item.code).then(function () {
                return _confirmRemoveProjectMembers(ProjectMemberInvitationRepository.getList());
            }).then(function () {
                projectCache = item;
                $ctrl.hasTargetProject = true;
            }, function () {
                $ctrl.form.inviteProject = projectCache;
                $ctrl.hasTargetProject = !!projectCache;
            });
        }

        function canInviteExternalMember() {
            return PermissionFactory.canInviteExternalMember(_.get($ctrl.form.inviteProject, 'organizationId', $ctrl.organizationId));
        }

        function setSelectProjectMode(value) {
            $ctrl.hasTargetProject = value;
        }

        function addMember() {
            if (!_validateSubmit()) {
                return;
            }

            var internalMemberIds = _getInternalMemberIds(),
                externalMemberEmails = $ctrl.form.memberExternalList;

            promise = $q.all([_addInternal(internalMemberIds), _addExternal(externalMemberEmails)]);

            promise.then(function (result) {
                $ctrl.$uibModalInstance.close();
                return InvitationModalFactory.confirm({
                    internal: _.result(result[0], 'result', []),
                    external: _.result(result[1], 'result', [])
                }, TagInputTaskHelper.getUniqMembersFromMemberOrGroups($ctrl.form.memberInternalList)).result;
            }).then(function () {
                InvitationModalFactory.open({
                    projectCode: _.get($ctrl.form.inviteProject, 'code'),
                    organizationId: $ctrl.organizationId
                });
            }).finally(function () {
                promise = null;
            });
        }

        function _init() {
            $ctrl.apiParam = { organizationId: $ctrl.organizationId, member: 'me', size: API_PAGE_SIZE.ALL };
            $ctrl.invitableRoles = [ORG_MEMBER_ROLE.GUEST, ORG_MEMBER_ROLE.MEMBER];
        }

        function _initInOrg() {
            $ctrl.apiParam = { organizationId: $ctrl.organizationId, size: 20 };
            $ctrl.invitableRoles = [ORG_MEMBER_ROLE.GUEST, ORG_MEMBER_ROLE.MEMBER, ORG_MEMBER_ROLE.ADMIN];
        }

        function _fetchProjectMembers(projectCode) {
            return _.get(ProjectMemberInvitationRepository.getCurrentParam(), 'projectCode') === projectCode ?
                $q.when() : ProjectMemberInvitationRepository.fetchAndCache({projectCode: projectCode, size: API_PAGE_SIZE.ALL});
        }

        function _confirmRemoveProjectMembers() {
            var internalMembersId = _getInternalMemberIds(),
                projectMemberIds = ProjectMemberInvitationRepository.getOrgMemberIdList();

            if (_.isEmpty(_.intersection(internalMembersId, projectMemberIds))) {
                return $q.when();
            }

            return MessageModalFactory.confirm(gettextCatalog.getString('<p>이미 프로젝트에 추가된 사용자는 제외되고 초대됩니다. </p><p>계속 진행하시겠습니까?</p>')).result.then(function () {
                _.remove($ctrl.form.memberInternalList, function (memberObj) {
                    return _.includes(projectMemberIds, _.get(memberObj, 'member.organizationMemberId'));
                });
                return $q.when();
            });
        }

        function _getInternalMemberIds() {
            return _(TagInputTaskHelper.getUniqMembersFromMemberOrGroups($ctrl.form.memberInternalList))
                .map('id')
                .compact()
                .value();
        }

        function _validateSubmit() {
            if (HelperPromiseUtil.isResourcePending(promise)) {
                return false;
            }

            if ($ctrl.hasTargetProject && !$ctrl.form.inviteProject) {
                MessageModalFactory.alert(gettextCatalog.getString('초대할 프로젝트를 선택해 주세요.'));
                return false;
            }

            if (_.isEmpty($ctrl.form.memberInternalList) &&
                _.isEmpty($ctrl.form.memberExternalList)) {
                $ctrl.showInvalidMsg = true;
                return false;
            }
            return true;
        }

        function _addInternal(memberIds) {
            if (_.isEmpty(memberIds)) {
                return $q.when({});
            }
            return ProjectMemberBiz.add(_.get($ctrl.form.inviteProject, 'code'), memberIds);
        }

        function _addExternal(emailMembers) {
            if (_.isEmpty(emailMembers)) {
                return $q.when({});
            }

            var projectId = $ctrl.hasTargetProject ? _.get($ctrl.form, 'inviteProject.id') : null,
                organizationId = $ctrl.hasTargetProject ? _.get($ctrl.form, 'inviteProject.organizationId') : $ctrl.organizationId;
            var params = _.map(emailMembers, function (emailMember) {
                return {
                    organizationId: organizationId,
                    inviteeEmail: emailMember.emailUser.emailAddress,
                    inviterName: $ctrl.form.inviterName,
                    projectId: projectId,
                    invitedOrganizationRole: $ctrl.form.inviteeRole.ROLE,
                    locale: $ctrl.form.locale
                };
            });

            return InvitationBiz.send(params);
        }

        function _fetchInvitorName() {
            MyInfo.getMyInfo().then(function (myInfo) {
                $ctrl.form.inviterName = myInfo.name;
            });
        }
    }

})();
