(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .factory('ProjectMembersModalFactory', ProjectMembersModalFactory)
        .controller('ProjectMembersModalCtrl', ProjectMembersModalCtrl);


    /* @ngInject */
    function ProjectMembersModalFactory ($uibModal, gettextCatalog) {
        function openModal(param) {
            return $uibModal.open({
                'templateUrl': 'modules/setting/common/project/projectMembersModal/projectMembersModal.html',
                'controller': 'ProjectMembersModalCtrl',
                'windowClass': 'setting-modal project-member-modal dooray-setting-content',
                'resolve': {
                    'param': param
                }
            });
        }


        return {
            open: function (projectCode) {
                return openModal({
                    projectCode: projectCode,
                    caption: gettextCatalog.getString('프로젝트 멤버')
                });
            },
            openOrgAdmin: function (organiztion) {
                return openModal({
                    organizationCode: organiztion.code,
                    organizationName: organiztion.name,
                    organizationId: organiztion.id,
                    role: 'owner, admin',
                    caption: gettextCatalog.getString('조직 관리자')
                });
            }
        };
    }

    /* @ngInject */
    function ProjectMembersModalCtrl ($scope, $state, $uibModalInstance, API_PAGE_SIZE, ORG_STATE_NAME, InvitationModalFactory, Member, PermissionFactory, ProjectMemberBiz, RootScopeEventBindHelper, param) {
        var inInOrgState = $state.includes(ORG_STATE_NAME);
        $scope.pageItemListSize = API_PAGE_SIZE.ALL;
        $scope.code = param.projectCode || param.organizationName;
        $scope.caption = param.caption;

        $scope.close = function () {
            $uibModalInstance.dismiss();
        };

        $scope.changeMemberPage = function (currentPage) {
            fetchMembers(currentPage - 1);
        };

        $scope.openInviteModal = function () {
            return InvitationModalFactory.open(_.assign(param, {
                projectMembers: $scope.members
            }));
        };

        $scope.getMember = function (member) {
            if(param.organizationCode) {
                return member;
            }
            return member._wrap.refMap.organizationMemberMap(member.organizationMemberId);
        };

        $scope.isShowInviteBtn = function () {
            return inInOrgState || PermissionFactory.canInviteMemberInProject();
        };

        var fetchMembers = function (page) {
            var api;

            if(param.organizationCode) {
                api = Member.fetchOrgMembers({
                    orgCode: param.organizationCode,
                    organizationMemberRoles: param.role,
                    size: $scope.pageItemListSize,
                    page: page
                });
            } else {
                api = ProjectMemberBiz.fetchList({
                    projectCode: param.projectCode,
                    size: $scope.pageItemListSize,
                    page: page
                });
            }

            api.then(function (members) {
                $scope.members = members.contents();
                $scope.memberTotalCnt = members.totalCount();
            });
        };

        fetchMembers(0);
        RootScopeEventBindHelper.withScope($scope)
            .on(ProjectMemberBiz.EVENTS.RESETCACHE, function () {
                fetchMembers(0);
            });
    }

})();




