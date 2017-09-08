(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .controller('PostListFilterCtrl', PostListFilterCtrl);

    /* @ngInject */
    function PostListFilterCtrl($element, $q, $scope, $state, $uibPosition, Member, MilestoneBiz, RootScopeEventBindHelper, StateParamsUtil, TagBiz, TaskListFilterService, _) {
        var self = this,
            loading = true,
            projectCodeFilter = StateParamsUtil.getProjectCodeFilter(),
            disableListener = {
                milestone: angular.noop,
                tags: angular.noop
            };

        self.filters = {};
        self.filterRule = MilestoneBiz.getMilestoneTabFilterRule('open');
        self.openMilestoneTabIndex = 0;
        self.displayFilterNames = '';
        self.tagFilter = {
            showMenus: false
        };

        // method
        self.resetFilters = resetFilters;
        self.showUserWorkflowClassMenu = TaskListFilterService.showUserWorkflowClassMenu;
        self.getShowFilterMenus = TaskListFilterService.getShowFilterMenus;
        self.findMembers = findMembers;
        self.changeMilestonesFilterRule = changeMilestonesFilterRule;
        self.milestoneDropdownOpen = milestoneDropdownOpen;

        function init() {
            self.filters = getShowFilters();
            TaskListFilterService.setShowFilterMenus(false);
            $q.all(promiseFetchAllDataWithMemberMilestoneTag()).then(function () {
                loading = false;
                TaskListFilterService.getDisplayFilterNames().then(function (displayFilterNames) {
                    self.displayFilterNames = displayFilterNames;
                });
            });
        }

        function promiseFetchAllDataWithMemberMilestoneTag() {
            var promises = [$q.when()];

            if ($state.current.data.filters.lastIndexOf('milestone') > -1 && StateParamsUtil.getProjectCodeFilter()) {
                promises.push(TaskListFilterService.fetchMilestones());
                disableListener.milestone();
                disableListener.milestone = RootScopeEventBindHelper.on($scope, MilestoneBiz.EVENTS.RESETCACHE, function () {
                    TaskListFilterService.fetchMilestones().then(reset);
                });
            }

            if ($state.current.data.filters.lastIndexOf('tags') > -1 && StateParamsUtil.getProjectCodeFilter()) {
                promises.push(TaskListFilterService.fetchTags());
                disableListener.tags();
                disableListener.tage = RootScopeEventBindHelper.on($scope, TagBiz.EVENTS.RESETCACHE, function () {
                    TaskListFilterService.fetchTags().then(reset);
                });
            }
            return promises;
        }

        function initFilters() {
            _.forEach(self.filters, function (filter) {
                filter.init();
            });
        }

        function resetFilters() {
            TaskListFilterService.resetFilterParam();
        }

        function getShowFilters() {
            var filters = {};

            _.forEach($state.current.data.filters, function (key) {
                if ((key === 'milestone' || key === 'tags') && !StateParamsUtil.getProjectCodeFilter()) {
                    return;
                }

                filters[key] = TaskListFilterService.filters[key];
            });
            return filters;
        }

        function findMembers(keyword) {
            var params = {
                type: 'member',
                name: keyword,
                page: 0,
                size: 20
            };
            if (projectCodeFilter) {
                params.boost = {
                    projectCode: projectCodeFilter
                };
            }
            return Member.search(params).then(function (result) {
                return result.contents();
            });
        }

        function changeMilestonesFilterRule(status) {
            self.filterRule = MilestoneBiz.getMilestoneTabFilterRule(status);
            self.openMilestoneTabIndex = status === 'open' ? 0 : 1;
        }

        function milestoneDropdownOpen() {
            var milestoneFilter$ = $element.find('.milestone-filter');
            if ($uibPosition.position(milestoneFilter$).left > 100) {
                milestoneFilter$.addClass('dropdown-right-position');
            } else {
                milestoneFilter$.removeClass('dropdown-right-position');
            }
        }

        function reset() {
            if (TaskListFilterService.getShowFilterMenus()) {
                initFilters();
            }
            TaskListFilterService.getDisplayFilterNames().then(function (displayFilterNames) {
                self.displayFilterNames = displayFilterNames;
            });
        }

        init();

        $scope.$watch(function () {
            return $state.params;
        }, function () {
            if (!_.isEmpty(self.filters) && !loading) {
                reset();
            }
        });

        $scope.$watch(TaskListFilterService.getShowFilterMenus, function (newVal) {
            if (newVal) {
                initFilters();
            }
        });

    }

})();
