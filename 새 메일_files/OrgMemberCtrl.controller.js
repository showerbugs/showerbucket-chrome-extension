(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .controller('OrgMemberCtrl', OrgMemberCtrl);

    /* @ngInject */
    function OrgMemberCtrl($compile, $scope, $state, $templateCache, ORG_MEMBER_ROLE, ID_PROVIDER_ID, TENANT_MEMBER_ROLE, ApiPageSizeFactory, IdProviderRepository, InvitationBiz, InvitationModalFactory, MemberProjectsModalFactory, MessageModalFactory, Member, ReinvitationModal, RootScopeEventBindHelper, gettextCatalog, moment, _) {
        var organization = {},
            orgRoleNameMap = {},
            tabDetail = {
                member: {
                    init: _initMemberTab,
                    fetchList: _fetchMemberList
                },
                inviting: {
                    init: _initInvitingTab,
                    fetchList: _fetchInvitingList
                },
                leaved: {
                    init: _initLeavedTab,
                    fetchList: _fetchLeavedList
                },
                guest: {
                    init: _initGuestTab,
                    fetchList: _fetchGuestList
                }
            };

        _init();

        // --------- declare methods ---------

        $scope.fetchList = fetchList;
        $scope.changeTab = changeTab;
        $scope.changeSize = changeSize;
        $scope.deleteMember = deleteMember;
        $scope.blockMember = blockMember;
        $scope.reInviteMember = reInviteMember;
        $scope.cancelInviteMember = cancelInviteMember;
        $scope.searchMember = searchMember;
        $scope.openInviteModal = openInviteModal;
        $scope.showProjects = showProjects;
        $scope.findMemberRoleName = findMemberRoleName;

        $scope.changeMemberRole = changeMemberRole;
        $scope.changeInvitationRole = changeInvitationRole;
        $scope.openDatePicker = openDatePicker;
        $scope.calcDurationDays = calcDurationDays;

        // --------- private functions ---------

        function _init() {
            _.forEach(ORG_MEMBER_ROLE, function (role) {
                orgRoleNameMap[role.ROLE] = gettextCatalog.getString(role.NAME);
            });
            $scope.TABS = {
                MEMBER: 'member',
                INVITING: 'inviting',
                LEAVED: 'leaved',
                GUEST: 'guest'
            };
            $scope.isInOrgSetting = true;
            $scope.memberRoleList = [ORG_MEMBER_ROLE.ADMIN, ORG_MEMBER_ROLE.MEMBER, ORG_MEMBER_ROLE.GUEST];
            $scope.sizeList = [100, 50, 30];
            $scope.current = { tab: $scope.TABS.MEMBER, size: ApiPageSizeFactory.getListApiSize() };
            $scope.ORG_MEMBER_ROLE = ORG_MEMBER_ROLE;

            RootScopeEventBindHelper.withScope($scope).on(Member.EVENTS.RESETCACHE, fetchList);
            organization = _.find($scope.myAdminOrgList, {code: $state.params.orgFilter}) || $scope.myAdminOrgList[0];
            _reset();
        }

        function _reset() {
            $scope.current.page = 1;
            $scope.current.keyword = '';
            tabDetail[$scope.current.tab].init();
        }

        // --------- member tab functions ---------

        function _initMemberTab() {
            _fetchIdProvider().then(function (idProviderList) {
                $scope.searchIdpList = _.forEach(idProviderList, function (idp) {
                    idp.name = ID_PROVIDER_ID[idp.id];
                });
                $scope.current.idp = $scope.searchIdpList[0].id;
            });
            $scope.searchRoleList = [{
                NAME: gettextCatalog.getString('전체'),
                ROLE: 'owner,admin,member'
            }, ORG_MEMBER_ROLE.ADMIN, ORG_MEMBER_ROLE.MEMBER];
            $scope.searchStatusList = [{
                name: gettextCatalog.getString('사용'),
                status: 'active'
            }, {
                name: gettextCatalog.getString('차단'),
                status: 'block'
            }];
            $scope.current.role = $scope.searchRoleList[0].ROLE;
            $scope.current.status = $scope.searchStatusList[0].status;

        }

        function _fetchMemberList(param) {
            param.q = $scope.current.keyword;
            param.organizationMemberRoles = $scope.current.role === ORG_MEMBER_ROLE.ADMIN.ROLE ?
                ([ORG_MEMBER_ROLE.OWNER.ROLE, $scope.current.role].join(',')) : $scope.current.role;
            param.idProviderId = $scope.current.idp;
            return Member.fetchListByRole(param).then(function (result) {
                _.forEach(result.contents(), function (member) {
                    member._getOrSetProp('idProvider', ID_PROVIDER_ID[member.idProviderId]);
                    member._getOrSetProp('role', member.organizationMemberRoleMap[organization.id].role);
                });
                return result;
            });
        }

        function changeMemberRole(member, role, prevRole) {
            var compiledRoleDescription = $compile($templateCache.get('modules/setting/common/invitation/orgMemberRoleDescription.html'))($scope),
                msg = gettextCatalog.getString('<span class="highlight">{{::role}}</span>로 변경하시겠습니까?', {role: orgRoleNameMap[role.ROLE]}) +
                angular.element('<div></div>').append(compiledRoleDescription).html();
            MessageModalFactory.confirm(msg, gettextCatalog.getString('권한 편집'), {confirmBtnLabel: gettextCatalog.getString('편집')}).result.then(function () {
                Member.changeOrgRole(member.id, organization.code, member._getOrSetProp('role'));
            }, function () {
                member._getOrSetProp('role', prevRole);
            });
        }

        // --------- inviting tab functions ---------

        function _initInvitingTab() {
            $scope.searchRoleList = [{
                NAME: gettextCatalog.getString('전체')
            }, ORG_MEMBER_ROLE.ADMIN, ORG_MEMBER_ROLE.MEMBER, ORG_MEMBER_ROLE.GUEST];
            $scope.current.role = $scope.searchRoleList[0].ROLE;
        }

        function _fetchInvitingList(param) {
            param.inviteeEmail = $scope.current.keyword;
            param.status = 'inviting';
            param.invitedOrganizationRole = $scope.current.role;
            return InvitationBiz.fetchListByStatus(param);
        }

        function changeInvitationRole(invitation) {
            if (!invitation) {
                return;
            }

            InvitationBiz.changeRole(invitation.id, invitation.invitedOrganizationMemberRole).then(function () {
                fetchList();
            });
        }


        // --------- leaved tab functions ---------

        function _initLeavedTab() {
            _fetchIdProvider().then(function (idProviderList) {
                $scope.searchIdpList = _.forEach(idProviderList, function (idp) {
                    idp.name = ID_PROVIDER_ID[idp.id];
                });
                $scope.current.idp = $scope.searchIdpList[0].id;
            });

        }

        function _fetchLeavedList(param) {
            param.tenantMemberRoles = TENANT_MEMBER_ROLE.LEAVER.ROLE;
            param.q = $scope.current.keyword;
            param.idProviderId = $scope.current.idp;
            return Member.fetchListByRole(param).then(function (result) {
                _.forEach(result.contents(), function (member) {
                    member._getOrSetProp('idProvider', ID_PROVIDER_ID[member.idProviderId]);
                });
                return result;
            });
        }

        // --------- guest tab functions ---------

        function _initGuestTab() {
            _fetchIdProvider().then(function (idProviderList) {
                $scope.searchIdpList = _.forEach(idProviderList, function (idp) {
                    idp.name = ID_PROVIDER_ID[idp.id];
                });
                $scope.current.idp = $scope.searchIdpList[0].id;
            });

            $scope.searchExpiredList = [{
                name: gettextCatalog.getString('전체')
            }, {
                name: gettextCatalog.getString('만료 예정'),
                expired: false
            }, {
                name: gettextCatalog.getString('만료'),
                expired: true
            }];
            $scope.current.isOpenDatePicker = false;
            $scope.current.expired = $scope.searchExpiredList[0].expired;

            $scope.dateOptions = {
                formatDayTitle: 'yyyy.MM.dd',
                formatDayHeader: 'EEE',
                showWeeks: false,
                startingDay: 0,
                minDate: moment().endOf('day').toDate()
            };
        }

        function _fetchGuestList(param) {
            param.tenantMemberRoles = TENANT_MEMBER_ROLE.GUEST.ROLE;
            param.q = $scope.current.keyword;
            param.idProviderId = $scope.current.idp;
            param.expired = $scope.current.expired;
            return Member.fetchListByRole(param).then(function (result) {
                var now = moment();
                _.forEach(result.contents(), function (member) {
                    member._getOrSetProp('idProvider', ID_PROVIDER_ID[member.idProviderId]);
                    member._getOrSetProp('role', member.organizationMemberRoleMap[organization.id].role);
                    member._getOrSetProp('status', now.isBefore(member.expirationDate) ? 'active': 'expired');
                });
                return result;
            });
        }

        function openDatePicker(member) {
            member._props.isOpenDatePicker = true;
        }

        function calcDurationDays(date) {
            return Math.min(moment(date).endOf('day').diff(moment().endOf('day')) / 1000 / 60 / 60 / 24, 999);
        }

        // --------- define methods ---------

        function changeTab(tab) {
            $scope.current.tab = tab;
            _reset();
            fetchList();
        }

        function changeSize() {
            ApiPageSizeFactory.changeOrApiSize($scope.current.size);
            fetchList();
        }

        function fetchList() {
            var param = {
                page: $scope.current.page - 1,
                size: $scope.current.size,
                organizationId: organization.id
            };

            tabDetail[$scope.current.tab].fetchList(param).then(function (result) {
                $scope.members = result.contents();
                $scope.memberTotalCnt = result.totalCount();
                $scope.refreshScroll();
            });
        }

        function deleteMember(memberId) {
            if (!memberId) {
                return;
            }
            var msg = gettextCatalog.getString('조직 탈퇴 이후에는 해당 조직으로 접근이 불가능합니다.');

            MessageModalFactory.confirm(msg, gettextCatalog.getString('조직 탈퇴'), {confirmBtnLabel: gettextCatalog.getString('탈퇴')}).result.then(function () {
                Member.deleteOrgMemberByMemberId(memberId, organization.code).then(function () {
                    fetchList();
                });
            });
        }

        function blockMember(memberId, memberName) {
            if (!memberId) {
                return;
            }

            var msg = gettextCatalog.getString([
                '<p class="text-align-left">차단 시 두레이에 연결된 모든 기기에서 로그아웃 처리하고 이후 접속을 제한합니다.</p>',
                '<p class="text-align-left"><span class="highlight">{{::memberName}}</span>님을 차단하시겠습니까?</p>'
            ].join(''), {memberName: memberName});

            MessageModalFactory.confirm(msg, gettextCatalog.getString('멤버 차단'), {confirmBtnLabel: gettextCatalog.getString('차단')}).result.then(function () {
                // TODO API 생성 후 추가
            });
        }

        function reInviteMember(invitation) {
            ReinvitationModal.open(invitation).result.then(function () {
                fetchList();
            });
        }

        function cancelInviteMember(memberId) {
            if (!memberId) {
                return;
            }

            InvitationBiz.cancel(memberId).then(function () {
                MessageModalFactory.alert(gettextCatalog.getString('초대를 취소하였습니다.'), gettextCatalog.getString('초대 메일 취소'));
                fetchList();
            });
        }

        function searchMember(searchKeyword) {
            searchKeyword = _.trim(searchKeyword || '');
            $scope.current.keyword = searchKeyword.toLowerCase();
            fetchList();
        }

        function openInviteModal() {
            InvitationModalFactory.open({organizationId: organization.id, isShowAllProjectList: true});
        }

        function showProjects(memberId) {
            MemberProjectsModalFactory.open(memberId);
        }

        function findMemberRoleName(role) {
            return orgRoleNameMap[role];
        }

        function _fetchIdProvider() {
            return IdProviderRepository.getOrFetchPromise().then(function () {
                var idProviderList = IdProviderRepository.getModel();
                if (idProviderList.length === 1) {
                    return idProviderList;
                }

                return [{
                    name: gettextCatalog.getString('전체')
                }].concat(_.map(IdProviderRepository.getModel(), function (idProvider) {
                        return { name: ID_PROVIDER_ID[idProvider.id], id: idProvider.id };
                    }));
            });
        }
    }
})();
