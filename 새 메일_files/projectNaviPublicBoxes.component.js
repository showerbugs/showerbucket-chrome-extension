(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('projectNaviPublicBoxes', {
            templateUrl: 'modules/project/navi/projectNaviPublicBoxes/projectNaviPublicBoxes.html',
            require: {
                navi: '^projectNavi'
            },
            controller: ProjectNaviPublicBoxes
        });

    /* @ngInject */
    function ProjectNaviPublicBoxes($scope, PROJECT_STATE_NAMES, MyInfo, PermissionFactory, Project, RootScopeEventBindHelper) {
        var self = this,
            disableListener = null,
            isOpenCache = self.isOpen;
        this.goStateName = PROJECT_STATE_NAMES.PROJECT_BOX;
        this.goStateOptions = {inherit : false, reload: this.goStateName};
        this.PROJECT_SCOPE = Project.PARAM_NAMES.SCOPE;
        this.isOpen = false;

        MyInfo.getMyInfo().then(function () {
            self.canShowPublicBoxes = !PermissionFactory.isTenantGuest();
        });

        this.$doCheck = function checkIsOpen() {
            if (!self.isOpen || isOpenCache === self.isOpen) {
                if (disableListener) {
                    disableListener();
                    disableListener = null;
                }
                isOpenCache = self.isOpen;
                return;
            }
            isOpenCache = self.isOpen;
            fetchProjectList();
            disableListener = RootScopeEventBindHelper.on($scope, Project.EVENTS.RESETCACHE, fetchProjectList);
        };

        function fetchProjectList() {
            Project.fetchActivePublicList()
                .then(function (result) {
                    self.publicProjects = result.contents();
                    self.navi.onChangeScrollVersion(open);
                });
        }
    }

})();
