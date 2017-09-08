(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('projectNaviMyBoxes', {
            templateUrl: 'modules/project/navi/projectNaviMyBoxes/projectNaviMyBoxes.html',
            require: {
                'navi': '^projectNavi'
            },
            controller: ProjectNaviMyBoxesCtrl
        });

    /* @ngInject */
    function ProjectNaviMyBoxesCtrl($q, $scope, PROJECT_STATE_NAMES, DigestService, MyInfo, PermissionFactory, Project, RootScopeEventBindHelper, _) {
        var self = this;
        this.myProjectListLoading = false;
        this.goStateName = PROJECT_STATE_NAMES.PROJECT_BOX;
        this.goStateOptions = {inherit : false, reload: this.goStateName};
        this.PROJECT_SCOPE = Project.PARAM_NAMES.SCOPE;
        this.isOrgMember = isOrgMember;
        fetchProjectList();

        RootScopeEventBindHelper.withScope($scope).on(Project.EVENTS.RESETCACHE, fetchProjectList);

        function fetchProjectList() {
            $q.all([Project.fetchMyActiveList(), MyInfo.getMyDefaultOrg(), MyInfo.getMyInfo()]).then(function (datas) {
                var result = datas[0],
                    defaultOrgId = datas[1].id,
                    orgMap = _.cloneDeep(_.result(datas[2], '_wrap.refMap.organizationMap'));

                _(result.contents()).groupBy(function (project) {
                    var orgId = project.organizationId;
                    orgMap[orgId] = orgMap[orgId] || result.refMap.organizationMap(orgId);
                    return project.organizationId;
                }).forEach(function(projects, orgId) {
                    _.set(orgMap[orgId], 'projects', projects);
                });

                self.myProjectsGroupInfo = _(orgMap).map(function (val) {
                    var isOpen = self.myProjectsGroupInfo ? _.get(_.find(self.myProjectsGroupInfo, {id: val.id}), isOpen, true) : true;
                    return {
                        id: val.id,
                        name: val.name,
                        isOpen: isOpen,
                        projects: val.projects
                    };
                }).sortBy(function (value) {
                    return value.id === defaultOrgId ? '' : value.name.toLowerCase();
                }).value();

                DigestService.loadingComplete($scope, '$ctrl.myProjectListLoading').then(function () {
                    self.navi.onChangeScrollVersion();
                });
            });
        }

        function isOrgMember(orgId) {
            return PermissionFactory.isOrgMember(orgId);
        }
    }

})();
