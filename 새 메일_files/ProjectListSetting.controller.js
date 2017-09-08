(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .controller('ProjectListSettingCtrl', ProjectListSettingCtrl);

    /* @ngInject */
    function ProjectListSettingCtrl ($scope, PROJECT_STATE_NAMES, HelperConfigUtil, MyInfo, ProjectMembersModalFactory, Project, PermissionFactory, ProjectDropModalFactory, ProjectManagementModalFactory, ProjectMemberBiz, RootScopeEventBindHelper, gettextCatalog, _) {
        var ALL_SCOPE = [Project.PARAM_NAMES.SCOPE.PRIVATE, Project.PARAM_NAMES.SCOPE.PUBLIC].join(',');

        $scope.pageItemListSize = 10;
        $scope.PROJECT_STATE_NAMES = PROJECT_STATE_NAMES;

        $scope.tab = {
            'active' : {
                'heading' : gettextCatalog.getString('진행.1')
            },
            'archived' : {
                'heading' : gettextCatalog.getString('종료')
            }
        };

        $scope.scopeFilterList = [{
            'name': gettextCatalog.getString('전체'),
            'value': ALL_SCOPE
        }, {
            'name': gettextCatalog.getString('일반'),
            'value': Project.PARAM_NAMES.SCOPE.PRIVATE
        }, {
            'name': gettextCatalog.getString('공개'),
            'value': Project.PARAM_NAMES.SCOPE.PUBLIC
        }];

        $scope.organizationList = [{
            'name': gettextCatalog.getString('조직'),
            'id': 'all'
        }];

        var calculateTaskCount = function (project) {
            project.counts._memberCount = _.get(project, 'projectMemberList.length', 0);
            project.counts.postCount._totalTaskCount = _.get(project, 'counts.postCount.workflow.registered', 0) +
                _.get(project, 'counts.postCount.workflow.working', 0) +
                _.get(project, 'counts.postCount.workflow.closed', 0);

        };

        var setMyRole = function (project) {
            var member =  _.find(project.projectMemberList, {'organizationMemberId': HelperConfigUtil.orgMemberId()});
            if(member) {
                project._getOrSetProp('myRole', member.role);
            }
        };

        var init = function(){
            $scope.current.page = 1;
            $scope.current.tab = 'active';
            $scope.current.scope = ALL_SCOPE;
            $scope.current.organizationId = 'all';
            $scope.current.query = '';
            fetchProjectList();
            fetchMyOrgList();
        };
        var fetchProjectList = function() {
            Project.fetchMyListWithParam({
                    page : $scope.current.page - 1,
                    size : $scope.pageItemListSize,
                    state: $scope.current.tab,
                    scope: $scope.current.scope,
                    query: _.trim($scope.current.query || '').toLowerCase(),
                    organizationId: $scope.current.organizationId,
                    order: 'name'
                }).then(function (result) {
                $scope.projects = _(result.contents()).filter(function(project){
                    calculateTaskCount(project);
                    setMyRole(project);
                    var hook = _.find(project.hooks, function (hook) {
                        return hook.toService === 'task_tracker';
                    });

                    var counts = _.map(_.get(hook, 'fromServices'), function (fromService) {
                        return fromService.count;
                    });
                    project.linkCount = _.sum(counts);
                    return project;
                }).value();
                $scope.projectTotalCnt = result.totalCount();
            });
        };

        var fetchMyOrgList = function () {
            MyInfo.getMyOrgList().then(function (myOrgList) {
                $scope.organizationList = $scope.organizationList.concat(myOrgList);
            });
        };
        init();
        Project.resetCache();

        function fetchProjectListWithResetCache(){
            Project.resetCache();
            fetchProjectList();
        }

        //프로젝트 멤버 추가/삭제 발생시 프로젝트 목록 갱신
        RootScopeEventBindHelper.withScope($scope)
            .on(ProjectMemberBiz.EVENTS.RESETCACHE, fetchProjectListWithResetCache)
            .on(Project.EVENTS.RESETCACHE, fetchProjectList);

        $scope.fetchProjectList = fetchProjectList;

        $scope.openCreateProject = function () {
            return ProjectManagementModalFactory.new();
        };

        $scope.modifyProject = function (projectCode, activeTabIndex) {
            return ProjectManagementModalFactory.open(projectCode, {activeTabName: activeTabIndex});
        };

        $scope.canCreateProject = function () {
            return PermissionFactory.canCreateProject();
        };

        $scope.removeMember = function (project) {
            var notClosedTaskCount = _.get(project, 'counts.myPostCount.workflow.registered', 0) + _.get(project, 'counts.myPostCount.workflow.working', 0);
            ProjectDropModalFactory.openLeaveModal(project.code, notClosedTaskCount, 'me').result.then(fetchProjectListWithResetCache);
        };

        $scope.resetSearch = function () {
            $scope.current.query = '';
            fetchProjectList();
        };

        $scope.changePage = function () {
            fetchProjectList();
        };

        $scope.changeTab = function (tab) {
            $scope.current.tab = tab;
            $scope.current.page = 1;
            fetchProjectList();
        };

        $scope.showMembers = function (project) {
            return ProjectMembersModalFactory.open(project.code);
        };

    }
})();
