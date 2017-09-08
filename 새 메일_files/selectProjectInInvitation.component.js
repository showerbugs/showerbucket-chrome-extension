(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .component('selectProjectInInvitation', {
            templateUrl: 'modules/setting/common/invitation/userInvitation/selectProjectInInvitation/selectProjectInInvitation.html',
            controller: SelectProjectInInvitation,
            bindings: {
                project: '=',
                apiParam: '<',
                onSelect: '&',
                initialProjectCode: '@'
            }
        });

    /* @ngInject */
    function SelectProjectInInvitation($scope, API_PAGE_SIZE, PROJECT_API_PARAM_NAMES, DigestService, Project, _) {
        var $ctrl = this,
            allProjectList = [],
            currentState = PROJECT_API_PARAM_NAMES.STATE.ACTIVE,
            currentQuery = '';

        $ctrl.PROJECT_API_PARAM_NAMES = PROJECT_API_PARAM_NAMES;
        $ctrl.searchProject = searchProject;
        $ctrl.changeProjectFilterRule = changeProjectFilterRule;

        this.$onInit = function () {
            $ctrl.activeTabIndex = 0;
            _fetchList(_.assign({}, $ctrl.apiParam, {
                size: API_PAGE_SIZE.ALL // size는 선택된 프로젝트가 안보일 수 있어서 전체를 모두 호출해야함
            }));
        };

        function searchProject(query) {
            currentQuery = query;
            $ctrl.projectList = _(allProjectList).filter(function (project) {
                return project.state === currentState && _.includes(project.code, query);
            }).take($ctrl.apiParam.size).value(); // apiParam에서 상태에 맞게 size를 조절
            DigestService.safeLocalDigest($scope); // 바로 반영되지 않아서 강제 digest 추가
        }

        function changeProjectFilterRule(state) {
            $ctrl.activeTabIndex = state === PROJECT_API_PARAM_NAMES.STATE.ACTIVE ? 0 : 1;
            currentState = state;
            searchProject(currentQuery);
        }

        function _fetchList(param) {
            return Project.fetchList(param).then(function (result) {
                allProjectList = result.contents();
                $ctrl.project = $ctrl.project || _.find(allProjectList, {code: $ctrl.initialProjectCode});
                searchProject(currentQuery);
            });
        }
    }

})();
