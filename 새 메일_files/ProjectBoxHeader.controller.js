(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .controller('ProjectBoxHeaderCtrl', ProjectBoxHeaderCtrl);

    /* @ngInject */
    function ProjectBoxHeaderCtrl($q, $scope, $state, MIME_TYPE, PROJECT_STATE_NAMES, BodyContentsConvertUtil, CommonItemList, CurrentListProjectRepository, InvitationModalFactory, PermissionFactory, PopupUtil, Project, ProjectArchiveService, ProjectDropModalFactory, ProjectManagementModalFactory, RootScopeEventBindHelper, StateParamsUtil, TaskTemplateApiBiz, ViewModeBiz, gettextCatalog, _) {
        var currentProject = {},
            projectScopeNameMap = {},
            projectScopeIconNameMap = {},
            WRITE_OPEN = 'write_open';

        projectScopeNameMap[Project.PARAM_NAMES.SCOPE.PRIVATE] = gettextCatalog.getString('프로젝트 멤버만 공개');
        projectScopeNameMap[Project.PARAM_NAMES.SCOPE.PUBLIC] = gettextCatalog.getString('조직 멤버에게 \'업무 전체\' 공개');
        projectScopeNameMap[WRITE_OPEN] = gettextCatalog.getString('조직 멤버에게 \'쓰기\'만 공개');
        projectScopeIconNameMap[Project.PARAM_NAMES.SCOPE.PRIVATE] = '';
        projectScopeIconNameMap[Project.PARAM_NAMES.SCOPE.PUBLIC] = gettextCatalog.getString('전체 공개');
        projectScopeIconNameMap[WRITE_OPEN] = gettextCatalog.getString('쓰기만 공개');

        $scope.projectModal = ProjectManagementModalFactory;
        $scope.PROJECT_STATE_NAMES = Project.PARAM_NAMES.STATE;
        $scope.downloadFilteredListUrl = '';
        $scope.downloadAllListUrl = '';

        $scope.ui = {
            isProjectAdmin: function () {
                return PermissionFactory.isProjectAdmin();
            },
            isActiveProject: function () {
                return currentProject.state === Project.PARAM_NAMES.STATE.ACTIVE;
            },
            canShowTitleMenu: function () {
                return PermissionFactory.isProjectMember();
            },
            canAddPost: function () {
                return currentProject.state === Project.PARAM_NAMES.STATE.ACTIVE &&
                    (PermissionFactory.isProjectMember() || currentProject.scope === Project.PARAM_NAMES.SCOPE.PUBLIC);
            }
        };

        $scope.openProjectSettings = openProjectSettings;
        $scope.openInviteModal = openInviteModal;
        $scope.exitProject = exitProject;
        $scope.changeProjectState = changeProjectState;
        $scope.getProjectScopeName = getProjectScopeName;
        $scope.getProjectScopeCode = getProjectScopeCode;
        $scope.setProjectDescription = setProjectDescription;
        $scope.openTaskTemplateWritePopup = openTaskTemplateWritePopup;

        // ------ define method ------

        function openProjectSettings(target, subTarget) {
            ProjectManagementModalFactory.open(StateParamsUtil.getProjectCodeFilter(), {
                activeTabName: target,
                activeSubTabName: subTarget
            });
        }

        function openInviteModal() {
            InvitationModalFactory.open({projectCode: StateParamsUtil.getProjectCodeFilter()});
        }

        function fetchProjectWithCount() {
            return Project.fetchByCode(StateParamsUtil.getProjectCodeFilter(), Project.PARAM_NAMES.EXT_FIELDS.COUNTS);
        }

        function exitProject() {
            fetchProjectWithCount().then(function (result) {
                var project = result.contents(),
                    activeTaskCount = _.get(project, 'counts.myPostCount.workflow.registered', 0) + _.get(project, 'counts.myPostCount.workflow.working', 0);
                ProjectDropModalFactory.openLeaveModal(project.code, activeTaskCount, 'me').result.then(function () {
                    $state.go(PROJECT_STATE_NAMES.TO_BOX, {filterStoreMode: true}, {reload: PROJECT_STATE_NAMES.TO_BOX});
                    Project.resetCache();
                });
            });
        }

        function changeProjectState(state) {
            var openTargetModal = state === Project.PARAM_NAMES.STATE.ARCHIVED ?
                ProjectArchiveService.openArchivedConfirm :
                ProjectArchiveService.openActiveConfirm;

            fetchProjectWithCount().then(function (result) {
                var project = result.contents(),
                    projectTaskCount = _.get(project, 'counts.postCount.workflow', {});
                _.set(project, '_counts.notClosedTaskCount', projectTaskCount.registered + projectTaskCount.working);
                openTargetModal(project).then(function () {
                    currentProject.state = state;
                    Project.update(StateParamsUtil.getProjectCodeFilter(), currentProject).then(function () {
                        CurrentListProjectRepository.reset();
                        $state.go('.', {}, {reload: PROJECT_STATE_NAMES.PROJECT_BOX});
                    });
                });
            });
        }

        function setProjectDescription(isShowMoreContent) {
            $scope.isShowDescriptionContent = currentProject.scope === Project.PARAM_NAMES.SCOPE.PUBLIC && ViewModeBiz.get() === ViewModeBiz.VIEW_MODE.FULL_VIEW;
            $scope.isShowMoreContent = !!isShowMoreContent;
            var body = { content: currentProject.description, mimeType: MIME_TYPE.MARKDOWN.type};
            if (!$scope.isShowDescriptionContent) {
                return;
            }

            if (isShowMoreContent) {
                $scope.projectDescription = BodyContentsConvertUtil.convertBodyToContent(body);
                return;
            }
            $scope.projectDescription = BodyContentsConvertUtil.convertToShortHtmlInTask(body, 50, true);
            $scope.projectDescription += body._hasMoreContent ? '...' : '';
            $scope.hasMoreContent = body._hasMoreContent;
        }

        function openTaskTemplateWritePopup(template) {
            PopupUtil.openTaskWritePopup('new', {projectCode: StateParamsUtil.getProjectCodeFilter(), templateId: template.id});
        }

        function fetchProject() {
            var currentProjectCode = StateParamsUtil.getProjectCodeFilter(),
                promise = $q.when();
            if (!CurrentListProjectRepository.hasProjectModelAbout(currentProjectCode)) {
                promise = CurrentListProjectRepository.fetchAndCache({projectCode: currentProjectCode});
            }
            promise.then(function () {
                currentProject = CurrentListProjectRepository.getModel();
                currentProject._getOrSetProp('scopeCode', getProjectScopeCode(currentProject));
                $scope.setProjectDescription();
                $scope.currentProject = currentProject;
                $scope.currentProjectScopeIconName = projectScopeIconNameMap[currentProject._getOrSetProp('scopeCode')];
            });
        }

        function fetchTemplate() {
            TaskTemplateApiBiz.query(StateParamsUtil.getProjectCodeFilter()).then(function(result){
                $scope.templateList = result.contents();
            });
        }

        function getProjectScopeCode(project) {
            if (_.isEmpty(project.publicPermissionList)) {
                return project.scope;
            }
            return _.isEqual(project.publicPermissionList[0].permission, Project.PARAM_NAMES.PUBLIC_SCOPE_PERMISSIONS.WRITE_ONLY) ?
                WRITE_OPEN : Project.PARAM_NAMES.SCOPE.PUBLIC;
        }

        function getProjectScopeName(project) {
            return projectScopeNameMap[getProjectScopeCode(project)];
        }

        function setExcelUrl() {
            var params = CommonItemList.getCallListApiParams();
            var excelDownloadUrl = ['/projects/', StateParamsUtil.getProjectCodeFilter(), '/posts/excel'].join(''),
                urlParamArray = [],
            // 엑셀 download Api 호출시에 filterStoreMode는 호출할 필요가 없으므로 제거
                exceptionParamKeys = ['page', 'size', 'filterStoreMode'];

            _.forEach(params, function (value, key) {
                if (_.includes(exceptionParamKeys, key) || !value) {
                    return;
                }

                urlParamArray.push(key + '=' + value);
            });
            $scope.downloadAllListUrl = excelDownloadUrl + '?order=' + params.order;
            $scope.downloadFilteredListUrl = urlParamArray.length > 0 ? excelDownloadUrl + '?' + urlParamArray.join('&') : excelDownloadUrl;
        }

        function initInFullView() {
            fetchTemplate();
            RootScopeEventBindHelper.withScope($scope).on(TaskTemplateApiBiz.EVENTS.RESETCACHE, fetchTemplate);
        }

        $scope.$watch(CommonItemList.getLoading, function (val) {
            if (!val) {
                setExcelUrl();
            }
        });

        RootScopeEventBindHelper.withScope($scope).on(Project.EVENTS.RESETCACHE, function () {
            CurrentListProjectRepository.fetchAndCache({projectCode: StateParamsUtil.getProjectCodeFilter()}).then(function () {
                fetchProject();
            });
        });
        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if (StateParamsUtil.getProjectCodeFilter(toParams) !== StateParamsUtil.getProjectCodeFilter(fromParams)) {
                fetchProject();
            }
        });
        fetchProject();

        if (ViewModeBiz.get() === ViewModeBiz.VIEW_MODE.FULL_VIEW)  {
            initInFullView();
        }
    }

})();
