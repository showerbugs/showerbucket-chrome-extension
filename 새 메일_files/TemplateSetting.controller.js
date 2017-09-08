(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .controller('TemplateSettingCtrl', TemplateSettingCtrl);

    /* @ngInject */
    function TemplateSettingCtrl($scope, EMIT_EVENTS, TEMPLATE_MAX_SIZE, MessageModalFactory, PopupUtil, HelperUrlUtil, RootScopeEventBindHelper, TaskTemplateApiBiz, gettextCatalog, _) {
        $scope.ui = {
            templates: [],
            preventDefaultKeyInput: {},
            TEMPLATE_MAX_SIZE: TEMPLATE_MAX_SIZE
        };

        $scope.popupNewTaskTemplate = function () {
            PopupUtil.openTaskTemplateWritePopup({projectCode: $scope.shared.projectCode});
        };

        $scope.popupUpdateTaskTemplate = function (templateId) {
            PopupUtil.openTaskTemplateWritePopup({projectCode: $scope.shared.projectCode, templateId: templateId});
        };

        var dragStartIndex = -1;

        $scope.onDragStart = function (index) {
            dragStartIndex = index;
        };

        $scope.onMoved = function (index) {
            var targetId = $scope.ui.templates[index].id;
            $scope.ui.templates.splice(index, 1);
            if (_.findIndex($scope.ui.templates, {id: targetId}) === dragStartIndex) {
                return;
            }
            var templateIdList = _.map($scope.ui.templates, function (template) {
                return template.id;
            });
            return TaskTemplateApiBiz.setOrder($scope.shared.projectCode, templateIdList);
        };

        $scope.removeTemplate = function (template) {
            MessageModalFactory.confirm(gettextCatalog.getString('<p>탬플릿을 삭제하면 다시 복구할 수 없습니다.</p><p>삭제하시겠습니까?</p>'), gettextCatalog.getString('템플릿 삭제'), {confirmBtnLabel: gettextCatalog.getString('삭제')}).result.then(function () {
                TaskTemplateApiBiz.remove($scope.shared.projectCode, template.id).then(function () {
                    _.remove($scope.ui.templates, template);
                });
            });
        };

        var fetchTemplates = function () {
            TaskTemplateApiBiz.query($scope.shared.projectCode).then(function (result) {
                $scope.ui.templates = result.contents() || [];
                _.forEach($scope.ui.templates, makeTemplateUrl);
            });
        };

        function makeTemplateUrl (template) {
            template.url = HelperUrlUtil.makeTaskWritePopupUrl('new', {
                projectCode: $scope.shared.projectCode,
                templateId: template.id
            }, {absolute: true});
        }

        RootScopeEventBindHelper.withScope($scope)
            .on(TaskTemplateApiBiz.EVENTS.RESETCACHE, fetchTemplates)
            .on(EMIT_EVENTS.CHANGE_PROJECT_MANAGEMENT_TAB_INDEX, fetchTemplates);
        TaskTemplateApiBiz.resetCache();
    }
})();
