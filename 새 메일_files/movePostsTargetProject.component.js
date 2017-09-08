(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('movePostsTargetProject', {
            templateUrl: 'modules/project/modals/MovePostsModal/movePostsTargetProject/movePostsTargetProject.html',
            controller: MovePostsTargetProject,
            bindings: {
                projectCode: '=',
                initialProjectCode: '<',
                isFromMePosts: '@',
                fromProjectCode: '@',
                onSelect: '&'
            }
        });

    /* @ngInject */
    function MovePostsTargetProject($q, HelperConfigUtil, MyInfo, Project) {
        var $ctrl = this,
            myProjects,
            orgMap,
            defaultOrgId,
            query = '';

        this.modelOptions = { updateOn: 'default', debounce: {'default': 100} };

        this.selectProject = selectProject;

        this.$doCheck = function () {
            if ($ctrl.query !== query) {
                query = $ctrl.query;
                _filterProjects(query);
            }
        };

        _init();

        function selectProject(project) {
            $ctrl.projectCode = _.get(project, 'code');
            $ctrl.onSelect();
        }

        function _filterProjects(_query) {
            var filteredProjects;
            if (_query) {
                filteredProjects = _(myProjects).filter(function (project) {
                    return project.code.toLowerCase().indexOf(_query.toLowerCase()) > -1;
                });
                $ctrl.hideMyPrivateProject = $ctrl.myPrivateProject ? ($ctrl.myPrivateProject._name.toLowerCase().indexOf(query.toLowerCase()) === -1) : true;
            } else {
                filteredProjects = _(myProjects);
                $ctrl.hideMyPrivateProject = false;
            }
            $ctrl.projectGroups = _groupProjects(filteredProjects);
        }

        function _groupProjects(lodashProjects) {
            return lodashProjects
                .groupBy('organizationId')
                .map(function (projects, orgId) {
                    var org = orgMap[orgId];
                    return {
                        id: org.id,
                        name: org.name,
                        projects: projects
                    };
                }).filter('projects').sortBy(function (value) {
                    return value.id === defaultOrgId ? '' : value.name.toLowerCase();
                }).value();
        }

        function _initMyPrivateProject() {
            if (!angular.fromJson($ctrl.isFromMePosts)) {
               return;
            }
            var myProject = HelperConfigUtil.myProjectItem();
            $ctrl.myPrivateProject = myProject.code === $ctrl.fromProjectCode ? null : myProject;
        }

        function _init() {
            _initMyPrivateProject();
            $q.all([Project.fetchMyActiveList(), MyInfo.getMyDefaultOrg()]).then(function (datas) {
                myProjects = _.filter(datas[0].contents(), function (project) {
                    return project.code !== $ctrl.fromProjectCode;
                });
                orgMap = datas[0].refMap.organizationMap();
                defaultOrgId = datas[1].id;
                $ctrl.projectGroups = _groupProjects(_(myProjects));
                $ctrl.hasOneOrg = $ctrl.projectGroups.length === 1;
                if ($ctrl.initialProjectCode && _.find(myProjects, {code: $ctrl.initialProjectCode})) {
                    $ctrl.projectCode = $ctrl.initialProjectCode;
                }
            });
        }

    }

})();
