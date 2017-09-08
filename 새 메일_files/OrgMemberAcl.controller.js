(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .controller('OrgMemberAclCtrl', OrgMemberAclCtrl);

    /* @ngInject */
    function OrgMemberAclCtrl($q, $scope, $state, Member, MemberAclBiz, MessageModalFactory, ProjectMemberGroupBiz, gettextCatalog, _) {
        var service = $scope.current.service,
            form = {
                allowedUsers: [],
                deniedUsers: []
            };

        _init();

        $scope.$watch('query', function (query) {
            if (!query) {
                $scope.current.userList.length = 0;
                return;
            }
            Member.searchWithParam(query).then(function (result) {
                $scope.current.userList = result.contents();
                _($scope.current.userList)
                    .intersectionWith($scope.current.selectedUsers, function (value, other) {
                        return value.type === other.type && value[value.type].id === other[other.type].id;
                    })
                    .forEach(function (user) {
                        user._checked = true;
                    });
            });
        });

        $scope.changeMemberTab = changeMemberTab;
        $scope.toggleMember = toggleMember;
        $scope.removeSelectedMember = removeSelectedMember;
        $scope.submit = submit;

        function _init() {
            $scope.FORM_NAME = 'memberAclForm';
            $scope.TABS = {
                ALLOWED: 'allowed',
                DENIED: 'denied'
            };
            $scope.ui = {
                allowedMemberCount: service._getOrSetProp('memberAllowedAcl').length,
                deniedMemberCount: service._getOrSetProp('memberDeniedAcl').length
            };

            $scope.current.hasChanged = false;
            $scope.current.userList = [];
            $scope.current.selectedUsers = [];
            $scope.current.memberTab = $scope.TABS.ALLOWED;
            form.allowedUsers = _convertAclToUsers(service._getOrSetProp('memberAllowedAcl'));
            form.deniedUsers = _convertAclToUsers(service._getOrSetProp('memberDeniedAcl'));
            _fetchSelectedUsers();
        }

        function _convertAclToUsers(acls) {
            return _.map(acls, function (acl) {
                return {
                    member: service._wrap.refMap.organizationMemberMap(acl.organizationMemberId),
                    type: 'member'
                };
            });
        }

        function _fetchSelectedUsers() {
            $scope.current.selectedUsers = $scope.current.memberTab === $scope.TABS.ALLOWED ? form.allowedUsers : form.deniedUsers;
        }

        function _findIndexUser(users, user) {
            return _.findIndex(users, function (_user) {
                return _user.type === user.type && _user[_user.type].id === user[user.type].id;
            });
        }

        function changeMemberTab(tabName) {
            $scope.current.memberTab = tabName;
            $scope.query = '';
            _fetchSelectedUsers();
        }

        function _confirmExceptMember() {
            var msg = [
                '<p>', gettextCatalog.getString('삭제 후, 더 이상 예외 처리되지 않습니다.'), '</p>' +
                '<p>', gettextCatalog.getString('삭제하시겠습니까?'), '</p>'
            ].join('');
            return MessageModalFactory.confirm(msg, gettextCatalog.getString('예외 사용자 삭제')).result;
        }

        function _convertUsersToIds(users) {
            var ids = [];
            _.forEach(users, function (user) {
                if (user.type === 'group') {
                    ids = ids.concat(_.map(user.group.members, 'member.id'));
                    return;
                }
                ids.push(user[user.type].id);
            });
            return _.uniq(ids);
        }

        function _fetchMemberIds() {
            var targetMemberProperty = $scope.current.memberTab === $scope.TABS.ALLOWED ? 'allowedMemberCount' : 'deniedMemberCount';
            $scope.ui[targetMemberProperty] = _convertUsersToIds($scope.current.selectedUsers).length;
        }

        function _fetchMemberGroupMembers(user) {
            return ProjectMemberGroupBiz.fetch({
                projectCode: '!' + user.group.projectId,
                projectMemberGroupId: user.group.id
            }).then(function (result) {
                return _.map(result.contents().organizationMemberIdList, function (id) {
                    return {
                        type: 'member',
                        member: result.refMap.organizationMemberMap(id)
                    };
                });
            });
        }

        function toggleMember(user) {
            $scope.current.hasChanged = true;
            var index = _findIndexUser($scope.current.selectedUsers, user);
            if (index > -1) {
                removeSelectedMember(user, index);
                return;
            }

            $scope.current.selectedUsers.push(user);
            _fetchMemberIds();

            if (user.type === 'group') {
                _fetchMemberGroupMembers(user).then(function (result) {
                    user.group.members = result;
                    _fetchMemberIds();
                });
            }
        }

        function removeSelectedMember(user, index, event) {
            event && event.stopPropagation();
            $scope.current.hasChanged = true;
            _confirmExceptMember().then(function () {
                $scope.current.selectedUsers.splice(index, 1);
                _.set(_findIndexUser($scope.current.userList, user), '_checked', false);
                _fetchMemberIds();
            }, function () {
                user._checked = !user._checked;
            });
        }

        function _convertUsersToAcls(users, allow) {
            return _.map(_convertUsersToIds(users), function (id) {
                return {
                    organizationMemberId: id,
                    allow: allow
                };
            });
        }

        function _removeAndConcatAcls(data, removeTarget, duplicatedIds) {
            _.remove(removeTarget, function (acl) {
                return _.includes(duplicatedIds, acl.organizationMemberId);
            });
            return data.concat(removeTarget);
        }

        function _confirmDuplicatedAcls(allowedAcls, deniedAcls) {
            var duplicatedIds = _(allowedAcls).intersectionBy(deniedAcls, 'organizationMemberId').map('organizationMemberId').value();
            if (_.isEmpty(duplicatedIds)) {
                return $q.when(allowedAcls.concat(deniedAcls));
            }

            var reverseAllowMsg = $scope.current.memberTab === $scope.TABS.ALLOWED ? gettextCatalog.getString('차단') : gettextCatalog.getString('허용');
            var msg = gettextCatalog.getString(
                    '<p>이미 {{::reverseAllow}} 목록에 등록된 사람 (<span class="highlight">{{::count}}명</span>)이 있습니다.</p>' +
                    '<p>허용과 차단 목록에 동시에 등록 할 수 없습니다.</p>',
                    {reverseAllow: reverseAllowMsg, count: duplicatedIds.length}
                ), title = gettextCatalog.getString('예외 사용자 추가'),
                confirmBtnLabel = gettextCatalog.getString('기존 목록에서 제거 후, 새로 등록'),
                optionBtnLabel = gettextCatalog.getString('기존 목록 유지');


            return MessageModalFactory.confirm(msg, title, {
                confirmBtnLabel: confirmBtnLabel,
                optionBtnLabel: optionBtnLabel
            }).result.then(function (reason) {
                    if ((reason === 'confirm' && $scope.current.memberTab === $scope.TABS.ALLOWED) ||
                        (reason === 'option' && $scope.current.memberTab === $scope.TABS.DENIED)) {
                        return $q.when(_removeAndConcatAcls(allowedAcls, deniedAcls, duplicatedIds));
                    }
                    return $q.when(_removeAndConcatAcls(deniedAcls, allowedAcls, duplicatedIds));
                });

        }

        function submit() {
            var allowedAcls = _convertUsersToAcls(form.allowedUsers, true),
                deniedAcls = _convertUsersToAcls(form.deniedUsers, false);

            _confirmDuplicatedAcls(allowedAcls, deniedAcls).then(function (requestBody) {
                MemberAclBiz.update($state.params.orgFilter, service.name, requestBody).then(function () {
                    MessageModalFactory.alert(gettextCatalog.getString('저장되었습니다.'));
                    $scope.close();
                });
            });
        }
    }

})();
