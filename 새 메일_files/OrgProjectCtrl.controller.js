(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .controller('OrgProjectCtrl', OrgProjectCtrl);


    /* @ngInject */
    function OrgProjectCtrl($scope, $state, ApiPageSizeFactory, MessageModalFactory, Project, ProjectArchiveService, ProjectManagementModalFactory, ProjectMemberBiz, ProjectMembersModalFactory, RootScopeEventBindHelper, gettextCatalog, _) {

        var organization = {};

        var init = function () {
            var ALL_STATE = [Project.PARAM_NAMES.STATE.ACTIVE, Project.PARAM_NAMES.STATE.ARCHIVED, Project.PARAM_NAMES.STATE.TRASHED].join(','),
                ALL_SCOPE = [Project.PARAM_NAMES.SCOPE.PRIVATE, Project.PARAM_NAMES.SCOPE.PUBLIC].join(',');

            Project.resetCache();

            $scope.tab = {
                'active': {
                    'heading': gettextCatalog.getString('진행.1')
                },
                'archived': {
                    'heading': gettextCatalog.getString('종료')
                },
                'trashed': {
                    'heading': gettextCatalog.getString('삭제.2')
                }
            };
            $scope.current = {};
            $scope.current.page = 1;
            $scope.current.state = ALL_STATE;
            $scope.current.scope = ALL_SCOPE;
            $scope.current.query = '';
            $scope.current.size = ApiPageSizeFactory.getListApiSize();
            $scope.sizeList = [100, 50, 30];

            organization = _.find($scope.myAdminOrgList, {code: $state.params.orgFilter}) || $scope.myAdminOrgList[0];

            $scope.scopeList = [
                {
                    'name': gettextCatalog.getString('일반'),
                    'scope': Project.PARAM_NAMES.SCOPE.PRIVATE
                },
                {
                    'name': gettextCatalog.getString('공개'),
                    'scope': Project.PARAM_NAMES.SCOPE.PUBLIC
                }/*, TODO permission 관련 필터가 생기면 추가
                 {
                 'name': gettextCatalog.getString('공개(쓰기)'),
                 'scope': Project.PARAM_NAMES.SCOPE.PUBLIC,
                 'permission': Project.PARAM_NAMES.PUBLIC_SCOPE_PERMISSIONS.WRITE_ONLY
                 },
                 {
                 'name': gettextCatalog.getString('공개(전체)'),
                 'scope': Project.PARAM_NAMES.SCOPE.PUBLIC,
                 'permission': Project.PARAM_NAMES.PUBLIC_SCOPE_PERMISSIONS.PUBLIC
                 }*/];

            $scope.scopeFilterList = [
                {
                    'name': gettextCatalog.getString('전체'),
                    'scope': ALL_SCOPE
                }].concat($scope.scopeList);

            RootScopeEventBindHelper.withScope($scope)
                .on(Project.EVENTS.RESETCACHE, fetchList)
                .on(ProjectMemberBiz.EVENTS.RESETCACHE, fetchList);
        };

        var fetchList = function () {
            $scope.current.query = _.trim($scope.current.query || '');
            Project.fetchList({
                'page': $scope.current.page - 1,
                'size': $scope.current.size,
                'state': $scope.current.tab,
                'scope': $scope.current.scope,
                'query': $scope.current.query.toLowerCase(),
                'extFields': Project.PARAM_NAMES.EXT_FIELDS.COUNTS,
                'organizationId': organization.id
            }).then(function (result) {
                setProjectMetaData(result.contents());
                $scope._filteredProjects = result.contents();

                $scope.projectTotalCnt = result.totalCount();
                $scope.refreshScroll();
            });
        };

        function setProjectMetaData(projects) {
            var now = moment().valueOf();
            _.forEach(projects, function (project) {
                project._getOrSetProp('fetchedAt', now);
                project._counts = {
                    'memberCount': _.get(project, 'counts.memberCount', 0),
                    'notClosedTaskCount': _.get(project, 'counts.postCount.workflow.registered', 0) + _.get(project, 'counts.postCount.workflow.working', 0),
                    'closedPostCount': _.get(project, 'counts.postCount.workflow.closed', 0),
                    'totalTaskCount': _.get(project, 'counts.postCount.workflow.registered', 0) + _.get(project, 'counts.postCount.workflow.working', 0) + _.get(project, 'counts.postCount.workflow.closed', 0)
                };
            });
            return projects;
        }

        $scope.fetchList = fetchList;
        $scope.stateAction = {
            'active': function (project) {
                return ProjectArchiveService.active(project);
            },
            'archived': function (project) {
                return ProjectArchiveService.archived(project);
            },
            'trashed': function (project) {
                return ProjectArchiveService.trashed(project);
            },
            'deleted': function (project) {
                return ProjectArchiveService.deleted(project);
            }
        };

        $scope.changeProjectState = function (project, state) {
            $scope.stateAction[state](project).then(function () {
                fetchList();
                MessageModalFactory.alert(gettextCatalog.getString('프로젝트 정보가 변경되었습니다.'));
            }, function () {
                fetchList();
            });
        };

        $scope.changeTab = function (tab) {
            $scope.current.tab = tab;
            $scope.current.page = 1;
            fetchList();
        };

        $scope.openProjectSetting = function (projectCode, activeTabName) {
            ProjectManagementModalFactory.open(projectCode, {activeTabName: activeTabName, openAsAdmin: true});
        };

        $scope.filterProjectState = function (state) {
            $scope.current.state = state;
            fetchList();
        };

        $scope.filterProjectScope = function (scope) {
            $scope.current.scope = scope.scope;
            $scope.current.permission = scope.permission;
            fetchList();
        };

        $scope.searchProject = function (query) {
            query = _.trim(query || '');
            $scope.current.query = query.toLowerCase();
            fetchList();
        };

        $scope.changePage = function () {
            fetchList();
        };

        $scope.changeSize = function () {
            ApiPageSizeFactory.changeOrApiSize($scope.current.size);
            fetchList();
        };

        $scope.showMembers = function (project) {
            return ProjectMembersModalFactory.open(project.code);
        };

        $scope.openCreateProject = function () {
            return ProjectManagementModalFactory.new(null, organization.id);
        };

        init();
    }
})();
