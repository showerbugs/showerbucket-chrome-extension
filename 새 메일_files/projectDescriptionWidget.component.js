(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('projectDescriptionWidget', {
            templateUrl: 'modules/project/view/dashBoard/widget/projectDescriptionWidget/projectDescriptionWidget.html',
            controller: projectDescriptionWidget,
            require: {
                dashboard: '^dashBoard'
            }
        });

    /* @ngInject */
    function projectDescriptionWidget($scope, Project, PermissionFactory, RootScopeEventBindHelper, StateParamsUtil) {
        var $ctrl = this;

        //PreDefined Callback;

        this.$onInit = function () {
            fetchProject();
            $ctrl.isProjectAdmin = PermissionFactory.isProjectAdmin();
        };

        this.$onChanges = function (/*changes*/) {

        };

        this.$onDestroy = function () {
        };

        function fetchProject() {
            return Project.fetchByCode(StateParamsUtil.getProjectCodeFilter()).then(function (result) {
                $ctrl.model = result.contents().description;
            });
        }

        RootScopeEventBindHelper.withScope($scope)
            .on(Project.EVENTS.RESETCACHE, fetchProject);
    }

})();
