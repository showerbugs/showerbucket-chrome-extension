(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('templateWidget', {
            templateUrl: 'modules/project/view/dashBoard/widget/templateWidget/templateWidget.html',
            controller: templateWidget,
            require: {
                dashboard: '^dashBoard'
            }
        });

    /* @ngInject */
    function templateWidget($scope, TaskTemplateApiBiz, StateParamsUtil, PopupUtil, RootScopeEventBindHelper) {
        var $ctrl = this;

        //PreDefined Callback;

        this.$onInit = function () {
            fetchTemplates();
        };

        this.$onChanges = function () {
        };

        this.$onDestroy = function () {
        };

        $ctrl.openTaskTemplateWritePopup = openTaskTemplateWritePopup;

        // template widget
        function fetchTemplates() {
            TaskTemplateApiBiz.query(StateParamsUtil.getProjectCodeFilter()).then(function(result){
                $ctrl.templates = result.contents();
            });
        }

        RootScopeEventBindHelper.withScope($scope)
            .on(TaskTemplateApiBiz.EVENTS.RESETCACHE, fetchTemplates);

        function openTaskTemplateWritePopup(template) {
            PopupUtil.openTaskWritePopup('new', {projectCode: StateParamsUtil.getProjectCodeFilter(),
                templateId: template.id});
        }

    }

})();
