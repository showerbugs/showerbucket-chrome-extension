(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('tagDetailStatusWidget', {
            templateUrl: 'modules/project/view/dashBoard/widget/detailStatusWidget/tagDetailStatusWidget/tagDetailStatusWidget.html',
            controller: TagDetailStatusWidget,
            require: {
                detail: '^detailStatusWidget'
            }
        });

    /* @ngInject */
    function TagDetailStatusWidget($scope, RootScopeEventBindHelper, TagBiz, DashBoardIndicator, StateParamsUtil) {
        var $ctrl = this;

        //PreDefined Callback;

        this.$onInit = function () {
            fetchTagList();
        };

        function fetchTagList() {
            return TagBiz.getTagWithPrefixesForSetting(StateParamsUtil.getProjectCodeFilter(), 'counts').then(function (result) {
                $ctrl.tagList = DashBoardIndicator.setNotClosedCount(result.contents(), 'counts.postCount');
            });
        }
        RootScopeEventBindHelper.on($scope, TagBiz.EVENTS.RESETCACHE, fetchTagList);

    }

})();
