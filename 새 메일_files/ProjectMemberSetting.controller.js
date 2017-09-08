(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .controller('ProjectMemberSettingCtrl', ProjectMemberSettingCtrl);

    /* @ngInject */
    function ProjectMemberSettingCtrl($scope, $state, MessageModalFactory, ProjectDropModalFactory, Project, ProjectMemberBiz, RootScopeEventBindHelper, HelperPromiseUtil, InvitationModalFactory, HelperConfigUtil, ProjectMemberGroupBiz, PermissionFactory,
                                      API_PAGE_SIZE, EMIT_EVENTS, ORG_MEMBER_ROLE, PATTERN_REGEX, PROJECT_STATE_NAMES, gettextCatalog, _) {
        $scope.ORG_MEMBER_ROLE = ORG_MEMBER_ROLE;
        $scope.SUB_TABS = {
            member: {name: gettextCatalog.getString('멤버')},
            group: {name: gettextCatalog.getString('그룹')}
        };
        $scope.activeGroupTabIndex = 0;
        $scope.subTabIndex = 0;
        var promise = null;

        function fetchProjectMember() {
            ProjectMemberBiz.fetchListByCode($scope.shared.projectCode, 'counts').then(function (result) {
                $scope.members = result.contents();
                $scope.myInfo = _.find($scope.members, {'organizationMemberId': HelperConfigUtil.orgMemberId()});
                $scope.adminMembers = _.filter($scope.members, {role: ORG_MEMBER_ROLE.ADMIN.ROLE});
                fetchMemberGroupList();
            });
        }

        Project.fetchByCode($scope.shared.projectCode).then(function (result) {
            $scope.project = angular.copy(result.contents());
        });

        $scope.openInviteModal = function () {
            return InvitationModalFactory.open({
                projectCode: $scope.shared.projectCode,
                projectMembers: $scope.members
            });
        };

        $scope.showInsertMemberGroupTab = function () {
            $scope.subTabIndex = 1;
            //TODO: angular-ui-bootstrap에서 ng-repeat으로 생성한 tab은 active index로 포함시키지 않는 버그. 버그 fix되면 수정
            $scope.activeGroupTabIndex = 1;
        };

        $scope.cancelActiveSubGroupTab = function () {
            $scope.activeGroupTabIndex = 0;
        };

        $scope.removeMember = function (member) {
            if (!member) {
                return;
            }

            var notClosedTaskCount = _.sum(_.get(member, 'counts.myPostCount.workflow'), function (count, workflowName) {
                return workflowName === 'closed' ? 0 : count;  // _.includes('registered, 'working', 'completed') === true;
            });
            ProjectDropModalFactory.openRemoveModal($scope.shared.projectCode, notClosedTaskCount, member.organizationMemberId).result.then(function () {
                ProjectMemberGroupBiz.resetCache();
                if (member.organizationMemberId === HelperConfigUtil.orgMemberId()) {
                    //Project 서비스에 캐시 삭제 하도록 한 후 본인이 나갔으면 /로 이동
                    Project.resetCache();
                    $state.go(PROJECT_STATE_NAMES.TO_BOX, {}, {reload: PROJECT_STATE_NAMES.TO_BOX});
                    $scope.close();
                }
            });
        };

        $scope.toggleRole = function (memberId, role) {
            if (!memberId) {
                return;
            }
            //사용자의 롤을 admin or member로 기존값을 참고하여 토글
            ProjectMemberBiz.changeRole($scope.shared.projectCode, memberId, role === ORG_MEMBER_ROLE.ADMIN.ROLE ? ORG_MEMBER_ROLE.MEMBER.ROLE : ORG_MEMBER_ROLE.ADMIN.ROLE).then(function () {
                if (memberId === HelperConfigUtil.orgMemberId()) {
                    $scope.close();
                }
            });
        };

        $scope.pageItemListSize = API_PAGE_SIZE.ALL;
        $scope.newGroup = {};

        $scope.PATTERN_REGEX = PATTERN_REGEX;

        var fetchMemberGroupList = function () {
            ProjectMemberGroupBiz.fetchListByCode($scope.shared.projectCode).then(function (result) {
                setGroups(result.contents());
            });
        };

        var fetchMemberGroup = function (group) { //멤버그룹을 업데이트해줌
            var param = {};
            param.projectCode = $scope.shared.projectCode;
            param.projectMemberGroupId = group.id;
            ProjectMemberGroupBiz.fetch(param).then(function (result) {
                findGroupAndRefresh(result.contents());
            });
        };

        $scope.isGuest = function () {
            return PermissionFactory.isTenantGuest();
        };

        var setGroups = function (result) {
            $scope.memberGroups = _.forEach(result, _assignMembersToGroup);
            $scope.memberGroupCnt = result.length;
        };

        var _assignMembersToGroup = function (memberGroup) {
            memberGroup._getOrSetProp('allMembers', setGroupMembers(memberGroup.organizationMemberIdList));
            memberGroup._getOrSetProp('editGroupCode', memberGroup.code);
            return memberGroup;
        };

        var setGroupMembers = function (organizationMemberIdList) { //리스트를 가져온후 멤버리스트에서 그룹에 포함된 멤버들의 값을 세팅해서 넣어준다.
            var allMembers = angular.copy($scope.members);
            _.forEach(allMembers, function (member) {
                member._getOrSetProp('isGroupMember', _.includes(organizationMemberIdList, member.organizationMemberId));
            });
            return allMembers;
        };

        var findGroupAndRefresh = function (result) { //해당 그룹만 업데이트
            var index = _.findIndex($scope.memberGroups, function (group) {
                return group.id === result.id;
            });
            _.assign($scope.memberGroups[index], _assignMembersToGroup(result));
            resetGroupEditMode();
        };

        var resetGroupEditMode = function () {
            _.forEach($scope.memberGroups, function (memberGroup) {
                memberGroup._getOrSetProp('nameEditMode', false);
                memberGroup._getOrSetProp('memberEditMode', false);
            });
        };

        $scope.cancelEditMode = function (memberGroup) {
            memberGroup._getOrSetProp('allMembers', setGroupMembers(memberGroup.organizationMemberIdList));
            memberGroup._getOrSetProp('nameEditMode', false);
            memberGroup._getOrSetProp('memberEditMode', false);
        };

        $scope.triggerCheckbox = function (member, editMode) {
            if (editMode) {
                member._getOrSetProp('isGroupMember', !member._getOrSetProp('isGroupMember'));
            }
        };

        $scope.stopBubbling = function ($event) {
            $event.stopPropagation();
        };

        $scope.updateGroupMember = function (memberGroup) {
            var param = {};
            param.projectCode = $scope.shared.projectCode;
            param.projectMemberGroupId = memberGroup.id;
            param.organizationMemberIdList = _(memberGroup._getOrSetProp('allMembers')).filter('_props.isGroupMember').map('organizationMemberId').value();
            if (!HelperPromiseUtil.isResourcePending(promise) && validationMember(param.organizationMemberIdList)) {
                promise = ProjectMemberGroupBiz.update(param).then(function () {
                    fetchMemberGroup(memberGroup);
                });
            }

        };

        $scope.updateGroupName = function (memberGroup) {
            if (memberGroup.code === memberGroup._getOrSetProp('editGroupCode')) {
                memberGroup._getOrSetProp('nameEditMode', false);
                return;
            }
            var param = {};
            param.projectCode = $scope.shared.projectCode;
            param.projectMemberGroupId = memberGroup.id;
            param.code = memberGroup._getOrSetProp('editGroupCode');
            if (!HelperPromiseUtil.isResourcePending(promise) && validationCode(param.code)) {
                promise = ProjectMemberGroupBiz.update(param).then(function () {
                    fetchMemberGroup(memberGroup);
                });
            }

        };

        $scope.createGroup = function () {
            var param = {}, submitData = {};
            param.projectCode = $scope.shared.projectCode;
            submitData.name = $scope.newGroup.name;
            submitData.code = submitData.name;
            submitData.organizationMemberIdList = [];
            _.forEach($scope.newGroup.selected, function (value, key) {
                if (value) {
                    submitData.organizationMemberIdList.push(key);
                }
            });
            if (!HelperPromiseUtil.isResourcePending(promise) && validationCode(submitData.code) && validationMember(submitData.organizationMemberIdList)) {
                promise = ProjectMemberGroupBiz.add(param, submitData).then(function () {
                    fetchMemberGroupList();
                    $scope.newGroup = {};
                });
            }
        };

        $scope.deleteGroup = function (memberGroup) {
            MessageModalFactory.confirm(gettextCatalog.getString('<p>해당 그룹을 삭제하시겠습니까?</p>'), gettextCatalog.getString('그룹 삭제')).result.then(function () {
                var param = {};
                param.projectCode = $scope.shared.projectCode;
                param.projectMemberGroupId = memberGroup.id;
                ProjectMemberGroupBiz.remove(param).then(function () {
                    fetchMemberGroupList();
                });
            });
        };

        function validationCode(code) {
            //TODO: ng-pattern 에 맞지 않을시 undefined 값이 넘어옴. 추후 form validation 형태로
            if (angular.isUndefined(code)) {
                MessageModalFactory.alert(gettextCatalog.getString('그룹명은 30자 이하의 영어, 한국어, 일본어, 중국어, 숫자, 특수 기호 ( ) . - ~로 입력해 주세요.'));
                return false;
            } else if (code.trim() === '') {
                MessageModalFactory.alert(gettextCatalog.getString('그룹명을 입력해 주세요.'));
                return false;
            } else if (hasGroupCode(code)) {
                MessageModalFactory.alert(gettextCatalog.getString('이미 사용 중입니다.'));
                return false;
            }
            return true;
        }

        function hasGroupCode(code) {
            return _.find($scope.memberGroups, {'code': code});
        }

        function validationMember(members) {
            if (!members || members.length === 0) {
                MessageModalFactory.alert(gettextCatalog.getString('멤버를 한 명 이상 선택해 주세요.'));
                return false;
            }
            return true;
        }

        function init() {
            fetchProjectMember();
            resetGroupEditMode();

            if ($scope.activeSubTabName && $scope.SUB_TABS[$scope.activeSubTabName]) {
                $scope.subTabIndex = _.keys($scope.SUB_TABS).indexOf($scope.activeSubTabName);
                $scope.activeSubTabName = null;
            } else {
                $scope.subTabIndex = 0;
            }
        }

        RootScopeEventBindHelper.withScope($scope)
            .on(EMIT_EVENTS.CHANGE_PROJECT_MANAGEMENT_TAB_INDEX, init)
            .on(ProjectMemberBiz.EVENTS.RESETCACHE, init);

        ProjectMemberBiz.resetCache();

    }
})();
