(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .controller('ProjectInfoSettingCtrl', ProjectInfoSettingCtrl);

    /* @ngInject */
    function ProjectInfoSettingCtrl($element, $location, $q, $scope, $state, DISABLED_ORG_ID_LIST, EMIT_EVENTS, ORG_MEMBER_ROLE, PROJECT_STATE_NAMES, ArrayUtil, CalendarAction, CheckDuplicatedUtil, HelperConfigUtil, HelperFormUtil, HelperPromiseUtil, MessageModalFactory, MyInfo, OrganizationBiz, Project, ProjectArchiveService, ProjectEmailBiz, ProjectManagementModalFactory, RootScopeEventBindHelper, SettingsProjectsBiz, gettextCatalog, _) {
        $scope.FORM_NAME = 'projectInfoForm';
        var originProject,
            projectSubmitPrimise,
            projectAllListPromise = $q.when();

        $scope.config = {
            height: 100,
            language: HelperConfigUtil.locale()
        };

        $scope.PROJECT_SCOPES = Project.PARAM_NAMES.SCOPE;
        $scope.projectScopeList = [
            {code: $scope.PROJECT_SCOPES.PRIVATE, name: gettextCatalog.getString('프로젝트 멤버만')},
            {code: $scope.PROJECT_SCOPES.PUBLIC, name: gettextCatalog.getString('조직 멤버 전체')}
        ];
        $scope.publicProjectPermissionList = [
            {code: Project.PARAM_NAMES.PUBLIC_SCOPE_PERMISSIONS.ALL, name: gettextCatalog.getString('전체')},
            {code: Project.PARAM_NAMES.PUBLIC_SCOPE_PERMISSIONS.WRITE_ONLY, name: gettextCatalog.getString('쓰기만')}
        ];
        $scope.organizationList = [];
        $scope.vm = {
            permission: [],
            organizations: []
        };

        $scope.projectEmail = {
            id: null,
            useEmail: false,
            emailLocalPart: '',
            // local은 dev로 변경
            domain: $location.host().replace('local', 'dev')
        };
        $scope.project = {
            scope: $scope.shared.projectScope || $scope.PROJECT_SCOPES.PRIVATE,
            state: 'active',
            organizationId: $scope.shared.organizationId,
            content: ''
        };

        $scope.serviceUse = HelperConfigUtil.serviceUse();
        $scope.enableNewFeature = HelperConfigUtil.enableNewFeature();

        $scope.cancel = _.debounce(function (event, newIndex, oldIndex) {
            if (oldIndex === 0) {
                fetchProject();
            }
        }, 100);

        $scope.checkDuplicatedCode = function (code) {
            return projectAllListPromise.then(function (projects) {
                if (_.get(originProject, 'code', null) === code) {
                    return $q.when(true);
                }
                return !CheckDuplicatedUtil.byString(projects, 'code', code);
            });
        };

        $scope.checkMaxLengthDescription = function (description) {
            return description ? description.length < 4190000 : true;
        };

        $scope.submit = function () {
            if (HelperFormUtil.checkInvaild($scope[$scope.FORM_NAME])) {
                $element.find('form[name="' + $scope.FORM_NAME + '"] .ng-invalid:first').focus();
                return;
            }
            //TODO: 에디터에서 content value를 쓰기 위해 : 리펙토링 필요
            $scope.project.description = $scope.project.content;

            if (_.isEmpty(originProject)) {
                confirmCreateProject().then(function () {
                    createProject();
                });
                return;
            }
            confirmUpdateProject().then(function () {
                updateProject().then(function () {
                    $scope.shared.projectCode = $scope.project.code;    //모달내에 각 탭 영역에서 공유하는 project.code를 업데이트함
                    if ($scope.project.code !== originProject.code &&
                        ($state.params.projectCodeFilter === originProject.code ||
                        $state.params.projectCode === originProject.code)) {
                        $state.go('.', {projectCode: $scope.project.code, projectCodeFilter: $scope.project.code}, {reload: $state.current.name}).then(function () {
                            Project.resetCache();
                        });
                        return;
                    }
                    Project.resetCache();
                });
            });
        };

        RootScopeEventBindHelper.withScope($scope)
            .on(Project.EVENTS.RESETCACHE, fetchProjectAllList)
            .on(EMIT_EVENTS.CHANGE_PROJECT_MANAGEMENT_TAB_INDEX, $scope.cancel);

        $scope.$watch('project.scope', function (newVal) {
            if (_.isEqual(newVal, $scope.PROJECT_SCOPES.PUBLIC)) {
                $scope.vm.permission = !_.isEmpty($scope.vm.permission) ? $scope.vm.permission : Project.PARAM_NAMES.PUBLIC_SCOPE_PERMISSIONS.ALL;
                return;
            }
            $scope.vm.permission = [];
            $scope.vm.organizations = [];
        });

        init();

        function init() {
            HelperFormUtil.bindService($scope, $scope.FORM_NAME);
            fetchOrganizations().then(function () {
                $scope.$watch('shared.projectCode', function (newVal) {
                    if (newVal) {
                        fetchProject();
                        return;
                    }
                    fetchOrganizationsCanCreateProject();
                });
            });
            fetchProjectAllList();
        }

        function setSelectedOrgs() {
            if (_.isEmpty($scope.organizationList) || _.isEmpty($scope.project.publicPermissionList)) {
                return;
            }
            var orgIds = _.map($scope.project.publicPermissionList, 'organizationId');

            //$scope.organizationList = _($scope.organizationList).concat(_.map($scope.project.publicPermissionList, function (organization) {
            //    return $scope.project._wrap.refMap.organizationMap(organization.organizationId);
            //})).uniqBy(function (organization) {
            //    return organization.id;
            //}).value();

            // organizationList에 현재 선택된 공개 org를 보여주기 위한 처리
            $scope.vm.organizations = _.filter($scope.organizationList, function (organization) {
                return _.includes(orgIds, organization.id);
            });
        }

        function confirmSubmitPublicProject(messegeBoxTitle, questionMessge) {
            var orgNames = _.map(!_.isEmpty($scope.vm.organizations) ? $scope.vm.organizations : $scope.organizationList, 'name').join(', '),
                message = ArrayUtil.isEqualEntity(Project.PARAM_NAMES.PUBLIC_SCOPE_PERMISSIONS.ALL, $scope.vm.permission) ?
                    gettextCatalog.getString('<p>{{orgNames}} 조직 멤버 모두에게 해당 프로젝트의 업무 전체가 공개됩니다.</p>', {orgNames: orgNames}) :
                    gettextCatalog.getString('<p>{{orgNames}} 조직 멤버 모두가 해당 프로젝트에 업무를 등록할 수 있습니다.</p>', {orgNames: orgNames});
            message += questionMessge;
            return MessageModalFactory.confirm(message, messegeBoxTitle).result;
        }

        function removePublicPermissions(organizationList) {
            if (!originProject) {
                return $q.when();
            }

            var params = _(originProject.publicPermissionList)
                .differenceWith(organizationList, function (originPermission, organization) {
                    return originPermission.organizationId === organization.id;
                })
                .map(function (permission) {
                    return {
                        organizationId: permission.organizationId
                    };
                })
                .value();

            if (!_.isEmpty(params)) {
                return Project.removePublicPermissions($scope.project.code, params);
            }

            return $q.when();
        }

        // ----------- data fetch 함수들 -----------

        function fetchProjectAllList() {
            projectAllListPromise = Project.fetchAllList().then(function (result) {
                return _.filter(result.contents(), function (project) {
                    return project.code !== _.get(originProject, 'code', null);
                });
            });
        }

        function fetchOrganizations() {
            return OrganizationBiz.fromServer().then(function (result) {
                $scope.organizationList = _.filter(result.contents(), function (organization) {
                    return !_.includes(DISABLED_ORG_ID_LIST, organization.id);
                });
                MyInfo.getMyDefaultOrg().then(function (defaultOrg) {
                    $scope.project.organizationId = $scope.project.organizationId || defaultOrg.id;
                });
                return result;
            });
        }

        function fetchProject() {
            Project.fetchByCode($scope.shared.projectCode, Project.PARAM_NAMES.EXT_FIELDS.COUNTS).then(function (result) {
                var project = result.contents();
                originProject = _.cloneDeep(project);
                $scope.project = _.cloneDeep(project);
                $scope.project._counts = {
                    'notClosedTaskCount': _.sum(project, 'counts.postCount.workflow')
                };

                $scope.project.useCalendar = !!project.calendarId;
                //TODO: 에디터에서 content value를 쓰기 위해 : 리펙토링 필요
                $scope.project.content = project.description;

                _initProjectEamil(project);

                //조직 ORG 공개대상일때 모든 ORG의 PUBLIC PERMISSION은 동일하므로 첫번째 ORG의 PUBLIC PERMISSION을 할당해 주도록 한다. template에서 eq
                if (!_.isEqual($scope.PROJECT_SCOPES.PUBLIC, $scope.project.scope) || _.isEmpty($scope.project.publicPermissionList)) {
                    return;
                }

                setSelectedOrgs();
                // 쓰기만 공개 프로젝트일 때 선택상태를 보여주기 위한 처리
                var permission = _.get($scope.project.publicPermissionList[0], 'permission');
                //TODO : 확인 요망 결국은 permission과 같은 값 리턴
                $scope.vm.permission = _($scope.publicProjectPermissionList)
                    .map('code')
                    .find(function (_permission) {
                        return _.isEqual(permission, _permission);
                    });
            });
        }

        function _initProjectEamil(project) {
            if (_.isEmpty(project.projectEmailAddressIdList)) {
                $scope.projectEmail.id = null;
                $scope.projectEmail.useEmail = false;
                $scope.projectEmail.emailLocalPart = '';
            } else {
                var projectEmailAddress = project._wrap.refMap.projectEmailAddressMap(project.projectEmailAddressIdList[0]);
                $scope.projectEmail.id = projectEmailAddress.id;
                $scope.projectEmail.useEmail = true;
                $scope.projectEmail.emailLocalPart = projectEmailAddress.emailAddressLocalPart;
            }
        }

        function fetchOrganizationsCanCreateProject() {
            $q.all([MyInfo.getMyInfo(), SettingsProjectsBiz.fetch()]).then(function (result) {
                var myInfo = result[0],
                    settings = result[1].contents(),
                    needChangeCreateOrganizationId = false;
                $scope.organizationsCanCreateProject = [];
                _.forEach(myInfo.organizationMemberRoleMap, function (meta, orgId) {
                    if (meta.role === ORG_MEMBER_ROLE.OWNER.ROLE ||
                        meta.role === ORG_MEMBER_ROLE.ADMIN.ROLE) {
                        appendToOrganizationsCanCreateProject(orgId);
                        return;
                    }
                    var setting = _.find(settings, {organizationId: orgId});
                    if (setting && setting.value.canCreateByAll) {
                        appendToOrganizationsCanCreateProject(orgId);
                        return;
                    }

                    if ($scope.project.organizationId === orgId) {
                        needChangeCreateOrganizationId = true;
                    }
                });
                if (needChangeCreateOrganizationId) {
                    $scope.project.organizationId = _.get($scope.organizationsCanCreateProject, '[0].id');
                }
            });
        }

        function appendToOrganizationsCanCreateProject(orgId) {
            var org = _.find($scope.organizationList, {id: orgId});
            if (org) {
                $scope.organizationsCanCreateProject.push(org);
            }
        }

        // ----------- create용 함수들 -----------

        function setProjectCalendar() {
            //프로젝트 캘린더 생성
            if($scope.project.useCalendar && !$scope.project.calendarId) {
                return CalendarAction.save({
                    name: $scope.project.code,
                    type: 'project',
                    color: '#666666', //TODO: 임의 할당
                    projectId: $scope.project.id
                });
            }
            //프로젝트 캘린더 삭제
            if(!$scope.project.useCalendar && $scope.project.calendarId) {
                return CalendarAction.remove($scope.project.calendarId);
            }

            return $q.when();
        }

        /* TODO BE 로직을 복구하면 풀기 */
        function setProjectEmail() {
            var requestBody = {emailAddressLocalPart: $scope.projectEmail.emailLocalPart};
            if (!$scope.projectEmail.id) {
                return $scope.projectEmail.useEmail ? ProjectEmailBiz.save($scope.project.code, $scope.projectEmail.id, requestBody) : $q.when();
            }
            return $scope.projectEmail.useEmail ? ProjectEmailBiz.update($scope.project.code, $scope.projectEmail.id, requestBody) :
                ProjectEmailBiz.remove($scope.project.code, $scope.projectEmail.id, requestBody);
        }

        function confirmCreateProject() {
            if (!$scope.project.organizationId) {
                MessageModalFactory.alert(gettextCatalog.getString('조직을 선택해 주세요.'));
                return $q.reject();
            }

            if ($scope.project.scope === Project.PARAM_NAMES.SCOPE.PUBLIC) {
                return confirmSubmitPublicProject(gettextCatalog.getString('공개 프로젝트 추가'), gettextCatalog.getString('<p>추가하시겠습니까?</p>'));
            }

            return $q.when();
        }

        function createProject() {
            if (HelperPromiseUtil.isResourcePending(projectSubmitPrimise)) {
                return;
            }

            projectSubmitPrimise = Project.add($scope.project).then(function () {
                var organizationList = !_.isEmpty($scope.vm.organizations) ? $scope.vm.organizations : $scope.organizationList;

                if ($scope.project.scope !== Project.PARAM_NAMES.SCOPE.PUBLIC) {
                    return $q.when();
                }

                //프로젝트 멤버만 공개 시 모든 ORG의 PUBLIC SCOPE PERMISSION을 일괄 제거함, 조직 멤버 공개 시 선택된 ORG가 없으면 모두 ORG에  공개 범위(전체|쓰기만) 적용하거나 선택한 ORG만 공개 범위 적용
                return Project.setPublicPermissions($scope.project.code, _.map(organizationList, function (organization) {
                    return {organizationId: organization.id, permission: $scope.vm.permission};
                }));
            }).then(function () {
                $state.go(PROJECT_STATE_NAMES.PROJECT_BOX, {projectCodeFilter: $scope.project.code}, {reload: PROJECT_STATE_NAMES.PROJECT_BOX});
                ProjectManagementModalFactory.open($scope.project.code, {activeTabName: ProjectManagementModalFactory.TAB_NAMES.MEMBER});
                $scope.close();
            }).catch(function () {
                MessageModalFactory.alert(gettextCatalog.getString('<p>일시적인 오류입니다.</p><p>다시 한번 시도해 주세요.</p>'));
            });
        }

        // ----------- update용 함수들 -----------
        function confirmUpdateProject() {
            var message;
            if (originProject.state !== $scope.project.state) {
                if ($scope.project.state === Project.PARAM_NAMES.STATE.ARCHIVED) {
                    return ProjectArchiveService.openArchivedConfirm($scope.project);
                }
                return ProjectArchiveService.openActiveConfirm($scope.project);
            }

            if ($scope.project.scope === Project.PARAM_NAMES.SCOPE.PUBLIC && _.isEmpty($scope.vm.organizations)) {
                if ($scope.organizationList.length !== 1) {
                    message = gettextCatalog.getString('공개 대상 조직을 선택해 주세요.');
                    MessageModalFactory.alert(message);
                    return $q.reject();
                }
                // 조직이 1개만 있는경우는 organizationList를 선택해줍니다.
                $scope.vm.organizations = $scope.organizationList;
            }

            if (originProject.scope !== $scope.project.scope &&
                $scope.project.scope === Project.PARAM_NAMES.SCOPE.PUBLIC) {
                return confirmSubmitPublicProject(gettextCatalog.getString('프로젝트 변경'), gettextCatalog.getString('<p>변경하시겠습니까?</p>'));
            }

            if (originProject.code !== $scope.project.code) {
                message = gettextCatalog.getString('<p>프로젝트명을 변경하면 업무 URL도 변경됩니다.</p><p>업무참조 링크는 영향을 받지 않습니다.</p><p>변경하시겠습니까?</p>');
                return MessageModalFactory.confirm(message, gettextCatalog.getString('프로젝트명 편집'), gettextCatalog.getString('편집')).result;
            }

            if (originProject.state !== Project.PARAM_NAMES.STATE.ACTIVE && $scope.project.state === Project.PARAM_NAMES.STATE.ACTIVE) {
                message = gettextCatalog.getString('해당 프로젝트를 다시 진행하시겠습니까?');
                return MessageModalFactory.confirm(message, gettextCatalog.getString('프로젝트 진행'), {confirmBtnLabel: gettextCatalog.getString('진행.2')}).result;
            }

            return $q.when();
        }

        function updateProject() {
            if (HelperPromiseUtil.isResourcePending(projectSubmitPrimise)) {
                return $q.reject();
            }

            projectSubmitPrimise = Project.update(originProject.code, $scope.project, true).then(function () {
                var organizationList = !_.isEmpty($scope.vm.organizations) ? $scope.vm.organizations : $scope.organizationList,
                    promises = [];

                promises.push(setProjectEmail());
                setProjectCalendar();

                if ($scope.project.scope === Project.PARAM_NAMES.SCOPE.PRIVATE) {
                    promises.push(removePublicPermissions([]));
                    return $q.all(promises);
                }
                promises.push(removePublicPermissions(organizationList));
                //프로젝트 멤버만 공개 시 모든 ORG의 PUBLIC SCOPE PERMISSION을 일괄 제거함, 조직 멤버 공개 시 선택된 ORG가 없으면 모두 ORG에  공개 범위(전체|쓰기만) 적용하거나 선택한 ORG만 공개 범위 적용
                promises.push(Project.setPublicPermissions($scope.project.code, _.map(organizationList, function (organization) {
                    return {organizationId: organization.id, permission: $scope.vm.permission};
                })));
                return $q.all(promises);
            }).then(function () {
                MessageModalFactory.alert(gettextCatalog.getString('프로젝트 정보가 변경되었습니다.'));
                $scope.close();
            }).catch(function () {
                MessageModalFactory.alert(gettextCatalog.getString('<p>일시적인 오류입니다.</p><p>다시 한번 시도해 주세요.</p>'));
            });

            return projectSubmitPrimise;
        }
    }


})();
