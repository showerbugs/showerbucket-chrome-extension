(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('PermissionFactory', PermissionFactory);

    /* @ngInject */
    function PermissionFactory($rootScope, $q, ITEM_TYPE, ORG_MEMBER_ROLE, PROJECT_MEMBER_ROLE, TENANT_MEMBER_ROLE, ArrayUtil, CurrentListProjectRepository, HelperConfigUtil, MyInfo, MessageModalFactory, Project, ProjectMemberBiz, ProjectMemberGroupBiz, RootScopeEventBindHelper, SettingsProjectsBiz, gettextCatalog, _) {
        var settings, myInfo, projectMetaDataMyInfo,
            promiseMap = {
                member: null,
                settingProject: null,
                projectMetaDataMyInfo: null,
                projectMemberGroup: null
            },
            settingByOrgId = {},
            myMemberId = HelperConfigUtil.orgMemberId(),
            orgAdminRoles = [ORG_MEMBER_ROLE.OWNER.ROLE, ORG_MEMBER_ROLE.ADMIN.ROLE],
            orgMemberRoles = [ORG_MEMBER_ROLE.OWNER.ROLE, ORG_MEMBER_ROLE.ADMIN.ROLE, ORG_MEMBER_ROLE.MEMBER.ROLE],
            projectMemberRoles = [PROJECT_MEMBER_ROLE.ADMIN.ROLE, PROJECT_MEMBER_ROLE.MEMBER.ROLE],
            tenantRoleList = [TENANT_MEMBER_ROLE.OWNER.ROLE, TENANT_MEMBER_ROLE.ADMIN.ROLE, TENANT_MEMBER_ROLE.MEMBER.ROLE, TENANT_MEMBER_ROLE.GUEST.ROLE, TENANT_MEMBER_ROLE.LEAVER.ROLE];

        fetchMyInfo();
        fetchSettingsProjects();

        RootScopeEventBindHelper.withScope($rootScope)
            .on(MyInfo.EVENTS.RESETCACHE, fetchMyInfo)
            .on(SettingsProjectsBiz.EVENTS.RESETCACHE, fetchSettingsProjects);

        return {
            fetchProjectMetaDataMyInfo: fetchProjectMetaDataMyInfo,
            fetchSettingsProjects: fetchSettingsProjects,
            canCreateProject: canCreateProject,
            canInviteMemberInProject: canInviteMemberInProject,
            canInviteExternalMember: canInviteExternalMember,
            confirmAccessTaskPromise: confirmAccessTaskPromise,
            canRemoveTask: canRemoveTask,
            canRemoveEmailOrBotComment: canRemoveEmailOrBotComment,
            canWriteNewSubPost: canWriteNewSubPost,
            canSetNotice: canSetNotice,
            canRemoveSharedLink: canRemoveSharedLink,
            canCreateSharedLink: canCreateSharedLink,
            canUseFilterMember: canUseFilterMember,
            isProjectAdmin: isProjectAdmin,
            isProjectMember: isProjectMember,
            isOrgMember: isOrgMember,
            isTenantGuest: isTenantGuest,
            hasTenantRole: hasTenantRole
        };

        // ------- fetch data & cache -------

        function fetchSettingsProjects() {
            promiseMap.settingProject = SettingsProjectsBiz.fetch().then(function (result) {
                settings = result.contents();
                settingByOrgId = _.keyBy(settings, 'organizationId');
                return settings;
            });
            return promiseMap.settingProject;
        }

        function fetchMyInfo() {
            promiseMap.member = MyInfo.getMyInfo().then(function (result) {
                myInfo = result;
            });
            return promiseMap.member;
        }

        function fetchProjectMetaDataMyInfo(projectCode) {
            promiseMap.projectMetaDataMyInfo = ProjectMemberBiz.fetchByMemberId(projectCode, myMemberId).then(function (result) {
                projectMetaDataMyInfo = _.result(result, 'contents');
            });
            return promiseMap.projectMetaDataMyInfo;
        }

        // ------- org permission -------

        function canAccessByOrgSetting(orgId, settingName) {
            var role = findOrgRole(orgId),
                canAccessByAll = findOrgSetting(orgId, settingName);
            if (role && _.isBoolean(canAccessByAll)) {
                return canAccessByAll ? isOrgMember(orgId) : isOrgAdmin(orgId);
            }
        }

        function canCreateProject(orgId) {
            return orgId ? canAccessByOrgSetting(orgId, 'canCreateByAll') :
                !isTenantGuest() && _(_.get(myInfo, 'organizationMemberRoleMap'))
                    .map(function (value, key) {
                        return _.get(settingByOrgId, ['[', key, '].value.canCreateByAll'].join(''));
                    }).some();
        }

        function canInviteMemberInProject() {
            return isProjectMember();
        }

        //외부 초대가 가능한지
        function canInviteExternalMember(orgId) {
            return  canAccessByOrgSetting(orgId, 'canInviteFromExternal');
        }

        // ------- project permission -------

        function hasProjectRole(role, project) {
            return _.includes(role, _.get(project || projectMetaDataMyInfo, 'role'));
        }

        function isProjectMember(project) {
            return hasProjectRole(projectMemberRoles, project);
        }

        function isProjectAdmin(project) {
            return hasProjectRole([PROJECT_MEMBER_ROLE.ADMIN.ROLE], project);
        }

        // ------- task permission -------

        function existInMembers(allPostMemberOrGroups) {
            var myOrgMemberId = HelperConfigUtil.orgMemberId();
            return _(allPostMemberOrGroups).filter({type: 'member'}).find(function (member) {
                return member.member.organizationMemberId === myOrgMemberId;
            });
        }

        function existInMemberGroups(allPostMemberOrGroups, projectCode) {
            var memberGroupIds = _(allPostMemberOrGroups).filter({type: 'group'}).map('group.projectMemberGroupId').value(),
                myMemberId = HelperConfigUtil.orgMemberId();
            return ProjectMemberGroupBiz.fetchListByCode(projectCode, memberGroupIds.join(',')).then(function (result) {
                return _(result.contents()).map('organizationMemberIdList').flatten().value().indexOf(myMemberId) !== -1;
            });
        }

        function canAccessTask(projectCode, fromId, toMembers, ccMembers) {
            return Project.fetchByCode(projectCode, Project.PARAM_NAMES.EXT_FIELDS.MEMBERS).then(function (result) {
                // 프로젝트의 멤버이거나 공개프로젝트인지 확인
                if (_.find(result.contents().projectMemberList, {'organizationMemberId': myMemberId}) ||
                    result.contents().scope === Project.PARAM_NAMES.SCOPE.PUBLIC) {
                    return true;
                }

                //from에 있는지 확인
                if (fromId === myMemberId) {
                    return true;
                }

                var allPostMemberOrGroups = toMembers.concat(ccMembers);

                // memberList에 있는지 확인
                if (existInMembers(allPostMemberOrGroups)) {
                    return true;
                }

                return existInMemberGroups(allPostMemberOrGroups, projectCode);
            });
        }

        function confirmAccessTaskPromise(projectCode, fromId, toMembers, ccMembers) {
            return canAccessTask(projectCode, fromId, toMembers, ccMembers).then(function (canSee) {
                if (canSee) {
                    return $q.when();
                }
                var message = gettextCatalog.getString('<p>변경한 담당자, 참조자 정보를 저장할 경우,</p><p>\'{{name}}\' 님은 더 이상 이 업무에 접근할 수 없습니다.<p></p>저장하시겠습니까?</p>', {name: myInfo.name});
                return MessageModalFactory.confirm(message).result.then(function () {
                    return {goListState: true};
                });
            });
        }

        function canWriteNewSubPost(post) {
            // 개인 프로젝트의 경우 예외처리
            if ('@' + myInfo.userCode === post.projectCode) {
                return $q.when();
            }
            return fetchProjectMetaDataMyInfo(post.projectCode).then(function(project) {
                return isProjectMember(project) ? $q.when() : $q.reject();
            });
        }

        function canSetNotice(post) {
            return fetchProjectMetaDataMyInfo(post.projectCode).then(function(project) {
                return isProjectMember(project) ? $q.when() : $q.reject();
            });
        }

        function canRemoveTask(post) {
            return isPostCreatorOrProjectAdmin(post);
        }

        function canRemoveEmailOrBotComment(item, type) {
            return type === ITEM_TYPE.POST ? isPostCreatorOrProjectAdmin(item) : (isCreator(item) ? $q.when() : $q.reject());
        }

        function canRemoveSharedLink(link) {
            if (link.createOrganizationMemberId === myMemberId) {
                return $q.when();
            }
            return fetchProjectMetaDataMyInfo(link.project.code).then(function(project) {
                return isProjectAdmin(project) ? $q.when() : $q.reject();
            });
        }

        function canCreateSharedLink(projectCode, fromMemberId) {
            if (fromMemberId && fromMemberId === myMemberId) {
                return $q.when();
            }
            return fetchProjectMetaDataMyInfo(projectCode).then(function(project) {
                return isProjectAdmin(project) ? $q.when() : $q.reject();
            });
        }

        function canUseFilterMember(projectCode) {
            if (!CurrentListProjectRepository.hasProjectModelAbout(projectCode)) {
                CurrentListProjectRepository.fetchAndCache();
                return true;
            }
            var project = CurrentListProjectRepository.getModel();
            return isProjectMember() ||
                (project.scope === Project.PARAM_NAMES.SCOPE.PUBLIC &&
                ArrayUtil.isEqualEntity(_.get(project, 'publicPermissionList[0].permission'), Project.PARAM_NAMES.PUBLIC_SCOPE_PERMISSIONS.ALL));
        }

        // ------- helper functions -------

        function isTenantGuest() {
            return _.get(myInfo, 'tenantMemberRole') === TENANT_MEMBER_ROLE.GUEST.ROLE;
        }

        function hasTenantRole(role, myTenantRole) {
            return tenantRoleList.indexOf(role) >= tenantRoleList.indexOf(myTenantRole || _.get(myInfo, 'tenantMemberRole', 1000));
        }

        function isOrgAdmin(orgId) {
            return _.includes(orgAdminRoles, findOrgRole(orgId));
        }

        function isOrgMember(orgId) {
            return _.includes(orgMemberRoles, findOrgRole(orgId));
        }

        function findOrgRole(orgId) {
            if (myInfo && orgId) {
                return _.get(myInfo.organizationMemberRoleMap[orgId], 'role', ORG_MEMBER_ROLE.GUEST.ROLE);
            }
        }

        function findOrgSetting(orgId, propName) {
            if (settings && orgId) {
                return _.get(_.find(settings, {'organizationId': orgId}), 'value.' + propName);
            }
        }

        function isPostCreatorOrProjectAdmin(post) {
            if (isCreator(post)) {
                return $q.when();
            }

            return fetchProjectMetaDataMyInfo(post.projectCode).then(function(project) {
                if(isProjectAdmin(project)){
                    return $q.when();
                } else {
                    return $q.reject();
                }
            });
        }

        function isCreator(item) {
            return _.get(item, 'users.from.member.id') === myMemberId;
        }


    }

})();
