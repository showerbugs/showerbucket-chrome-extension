(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('memberDetailStatusWidget', {
            templateUrl: 'modules/project/view/dashBoard/widget/detailStatusWidget/memberDetailStatusWidget/memberDetailStatusWidget.html',
            controller: MemberDetailStatusWidget,
            require: {
                detail: '^detailStatusWidget'
            }
        });

    /* @ngInject */
    function MemberDetailStatusWidget($scope, RootScopeEventBindHelper, ProjectMemberBiz,  DashBoardIndicator, StateParamsUtil) {
        var $ctrl = this;
        var unbindEventListener;

        this.$onInit = function () {
            fetchProjectMemberList();
        };

        this.$onDestroy = function () {
            unbindEventListener();
        };

        function fetchProjectMemberList() {
            return ProjectMemberBiz.fetchListByCode(StateParamsUtil.getProjectCodeFilter(), 'counts').then(function (result) {
                $ctrl.projectMemberList = DashBoardIndicator.setNotClosedCount(result.contents());
            });
        }

        unbindEventListener = RootScopeEventBindHelper.on($scope, ProjectMemberBiz.EVENTS.RESETCACHE, fetchProjectMemberList);

    }

})();
