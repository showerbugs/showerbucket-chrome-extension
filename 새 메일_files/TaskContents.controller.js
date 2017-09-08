(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .controller('TaskContentsCtrl', TaskContentsCtrl);

    /* @ngInject */
    function TaskContentsCtrl($controller, $scope, $state, ITEM_TYPE, PATTERN_REGEX, PROJECT_STATE_NAMES, BrowserTitleChangeAction, DetailInstanceFactory, DigestService, PermissionFactory, Project, ProjectUtil, RootScopeEventBindHelper, StateHelperUtil, StateParamsUtil, TaskViewModalFactory, ViewModeBiz, gettextCatalog, _) {
        $controller('DefaultContentsCtrl as defaultContentsCtrl', {$scope: $scope});
        var self = this;

        // selectedTask가 선언되는 가장 최상위
        $scope.selectedTask = DetailInstanceFactory.getOrMakeSelectedItem(ITEM_TYPE.POST);
        $scope.selectedTask.reset();

        $scope.searchScope = $state.params.scope || '1';
        $scope.searchScopeList = [
            {label: gettextCatalog.getString('전체 업무'), code: '3'},
            {label: gettextCatalog.getString('내 프로젝트'), code: '2'},
            {label: 'From/To/Cc', code: '1'}
        ];

        $scope.searchWithScope = searchWithScope;

        this.isToBox = isToBox;
        this.isProjectBox = isProjectBox;

        function getBoxTitle() {
            if ($state.includes(PROJECT_STATE_NAMES.PROJECT_BOX)) {
                return StateParamsUtil.getProjectCodeFilter();
            }

            return ProjectUtil.getProjectCodeByStateName(StateHelperUtil.computeCurrentListStateName());
        }

        function isToBox() {
            return $state.includes(PROJECT_STATE_NAMES.TO_BOX);
        }

        function isProjectBox() {
            return $state.includes(PROJECT_STATE_NAMES.PROJECT_BOX);
        }

        function setCanShowDashBoard(isToProjectBox) {
            if ($state.includes(PROJECT_STATE_NAMES.TO_BOX)) {
                self.canShowDashBoard = isToBox();
                DigestService.safeGlobalDigest();
                return;
            }

            if (isToProjectBox) {
                PermissionFactory.fetchProjectMetaDataMyInfo(StateParamsUtil.getProjectCodeFilter()).then(function () {
                    self.canShowDashBoard = PermissionFactory.isProjectMember();
                    DigestService.safeGlobalDigest();
                });
                return;
            }
            self.canShowDashBoard = false;
        }

        function setIsArchivedProjectInProjectBox() {
            Project.fetchByCode(StateParamsUtil.getProjectCodeFilter()).then(function (result) {
                self.isArchivedProject = _.get(result.contents(), 'state') === Project.PARAM_NAMES.STATE.ARCHIVED;
            });
        }

        function setIsArchivedProject(isToProjectBox, toState) {
            if (!isToProjectBox) {
                self.isArchivedProject = _.includes(toState.name, PROJECT_STATE_NAMES.PROJECT_BOX) ? self.isArchivedProject : false;
                return;
            }

            setIsArchivedProjectInProjectBox();
        }

        function searchWithScope(data) {
            var query = $state.params.query.replace(PATTERN_REGEX.projectCodeInSearchParam, '');
            $state.go(PROJECT_STATE_NAMES.SEARCH_BOX, {
                scope: data.code,
                query: query
            }, {reload: PROJECT_STATE_NAMES.SEARCH_BOX, inherit: false});
        }

        function onStateChangeSuccess() {
            $scope.searchScope = $state.params.scope || '1';
            $scope.currentBoxTitle = getBoxTitle();

            if (!StateHelperUtil.isViewStateByName($state.current.name)) {
                BrowserTitleChangeAction.changeBrowserTitle(getBoxTitle());
            }

            if (!$state.includes('**.view')) {
                $scope.selectedTask.reset();
            } else {
                if (ViewModeBiz.get() === ViewModeBiz.VIEW_MODE.FULL_VIEW) {
                    TaskViewModalFactory.openFullViewModal();
                }
            }

            var isToProjectBox = _.includes($state.current.name, PROJECT_STATE_NAMES.PROJECT_BOX) && !_.includes($state.current.name, PROJECT_STATE_NAMES.PROJECT_BOX_VIEW);
            setIsArchivedProject(isToProjectBox, $state.current);
            setCanShowDashBoard(isToProjectBox);
        }

        function onLocationChangeSuccess() {
            if (!StateParamsUtil.getListStatus()) {
                onStateChangeSuccess();
            }
        }

        $scope.$on('$locationChangeSuccess', onLocationChangeSuccess);
        $scope.$on('$stateChangeSuccess', onStateChangeSuccess);

        RootScopeEventBindHelper.withScope($scope)
            .on(Project.EVENTS.RESETCACHE, function () {
                if ($state.includes(PROJECT_STATE_NAMES.PROJECT_BOX)) {
                    setIsArchivedProjectInProjectBox();
                }
            });
    }

})();
