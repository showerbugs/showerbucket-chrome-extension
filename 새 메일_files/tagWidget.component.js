(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('tagWidget', {
            templateUrl: 'modules/project/view/dashBoard/widget/tagWidget/tagWidget.html',
            controller: tagWidget,
            require: {
                dashboard: '^dashBoard'
            }
        });

    /* @ngInject */
    function tagWidget($scope, TagBiz, ProjectDashBoardService, StateParamsUtil, RootScopeEventBindHelper) {
        var $ctrl = this;

        //PreDefined Callback;

        this.$onInit = function () {
            fetchTagsInTagWidget();
        };

        this.$onChanges = function () {
        };

        this.$onDestroy = function () {
        };

        $ctrl.goStateWith = ProjectDashBoardService.goStateWith;

        RootScopeEventBindHelper.withScope($scope)
            .on(TagBiz.EVENTS.RESETCACHE, fetchTagsInTagWidget);

        function fetchTagsInTagWidget() {
            return TagBiz.getTagWithPrefixesForSetting(StateParamsUtil.getProjectCodeFilter()).then(function (result) {
                $ctrl.tagGroups = result._tagGroups;
            });
        }
    }

})();
