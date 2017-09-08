(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('projectNavi', {
            bindings: {
                openSettingModal: '&'
            },
            templateUrl: 'modules/project/navi/projectNavi.html',
            controller: ProjectNaviCtrl
        });

    /* @ngInject */
    function ProjectNaviCtrl($state, DISABLED_ORG_ID_LIST, PROJECT_STATE_NAMES, PopupUtil, PermissionFactory, ProjectManagementModalFactory, SettingModalFactory, StateParamsUtil) {
        var $ctrl = this;
        this.PROJECT_STATE_NAMES = PROJECT_STATE_NAMES;
        this.scrollVersion = 1;

        this.canCreateProject = canCreateProject;
        this.isActiveState = isActiveState;
        this.isActiveBox = isActiveBox;
        this.openTaskWritePopup = openTaskWritePopup;
        this.openCreateProject = openCreateProject;
        this.openSettingModal = openSettingModal;
        this.onChangeScrollVersion = onChangeScrollVersion;

        this.myProjectsGroupInfo = {};

        function canCreateProject(orgId) {
            return !_.includes(DISABLED_ORG_ID_LIST, orgId) && PermissionFactory.canCreateProject(orgId);
        }

        function isActiveState(stateName) {
            return $state.current.name.indexOf(stateName) > -1;
        }

        function isActiveBox(item) {
            return $state.current.name.indexOf(PROJECT_STATE_NAMES.PROJECT_BOX) > -1 &&
                item.code === StateParamsUtil.getProjectCodeFilter();
        }

        function openTaskWritePopup() {
            PopupUtil.openTaskWritePopup('new', {projectCode: $state.params.projectCode || $state.params.projectCodeFilter});
        }

        function openCreateProject(projectScope, organizationId) {
            return ProjectManagementModalFactory.new(projectScope, organizationId);
        }

        function openSettingModal(openTarget) {
            SettingModalFactory.open(openTarget);
        }

        function onChangeScrollVersion() {
            $ctrl.scrollVersion += 1;
        }
    }

})();
