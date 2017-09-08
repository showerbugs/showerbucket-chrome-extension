(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('projectDetailStatusWidget', {
            templateUrl: 'modules/project/view/dashBoard/widget/detailStatusWidget/projectDetailStatusWidget/projectDetailStatusWidget.html',
            controller: ProjectDetailStatusWidget,
            require: {
                detail: '^detailStatusWidget'
            }
        });

    /* @ngInject */
    function ProjectDetailStatusWidget($scope, RootScopeEventBindHelper, MyInfo, Project, DashBoardIndicator, gettextCatalog) {
        var $ctrl = this;
        var DEFAULT_ORG_LIST = [{id: 'all', name: gettextCatalog.getString('전체')}];

        this.$onInit = function () {
            $ctrl.currentOrganizationId = 'all';
            fetchOrganization();
            fetchMyProjectList();
        };

        this.$onChanges = function () {
        };

        this.$onDestroy = function () {
        };

        $ctrl.fetchMyProjectList = fetchMyProjectList;

        function fetchOrganization() {
            return MyInfo.getMyOrgList().then(function (myOrgList) {
                $ctrl.organizationList = DEFAULT_ORG_LIST.concat(myOrgList);
            });
        }

        function fetchMyProjectList() {
            return Project.fetchMyActiveList($ctrl.currentOrganizationId, Project.PARAM_NAMES.EXT_FIELDS.COUNTS).then(function (result) {
                $ctrl.projectList = DashBoardIndicator.setNotClosedCount(result.contents());
            });
        }

        RootScopeEventBindHelper.withScope($scope).on(Project.EVENTS.RESETCACHE, fetchMyProjectList);
    }

})();
