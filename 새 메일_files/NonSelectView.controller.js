(function () {

    'use strict';

    angular
        .module('doorayWebApp.layout')
        .controller('NonSelectViewCtrl', NonSelectViewCtrl);

    /* @ngInject */
    function NonSelectViewCtrl($scope, $state, $stateParams, PROJECT_STATE_NAMES, PermissionFactory, TaskTemplateApiBiz, PopupUtil, Project, ProjectManagementModalFactory) {
        $scope.canCreateProject = PermissionFactory.canCreateProject();
        $scope.openTaskWritePopup = function () {
            PopupUtil.openTaskWritePopup('new', {projectCode: $stateParams.projectCodeFilter});
        };
        $scope.openCreateProject = function () {
            ProjectManagementModalFactory.new();
        };
        $scope.openTaskTemplateWritePopup = function (template) {
            PopupUtil.openTaskWritePopup('new', {projectCode: $stateParams.projectCodeFilter, templateId: template.id});
        };

        if($state.includes(PROJECT_STATE_NAMES.PROJECT_BOX)) {
            Project.fetchByCode($stateParams.projectCodeFilter).then(function (result) {
                $scope.currentProject = result.contents();
            });
            TaskTemplateApiBiz.query($stateParams.projectCodeFilter).then(function(result){
                $scope.templates = result.contents();
            });
        }
    }

})();
