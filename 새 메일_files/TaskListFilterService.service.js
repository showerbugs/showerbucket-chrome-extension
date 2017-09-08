(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .service('TaskListFilterService', TaskListFilterService)
        .factory('TaskListFilterConstructorFactory', TaskListFilterConstructorFactory);

    /* @ngInject */
    function TaskListFilterService($q, $state, PROJECT_STATE_NAMES, HelperPromiseUtil, PermissionFactory, StateParamsUtil, TaskListFilterConstructorFactory, _) {
        var allFilters = {
            to: new TaskListFilterConstructorFactory.MemberFilter('to')
                .withAfterGoFilteredMenu(function () {
                    allFilters.toMeCheckBox.init();
                })
                .withIsDisabled(function () {
                    return !_canUseMemberFilter();
                }),
            cc: new TaskListFilterConstructorFactory.MemberFilter('cc')
                .withIsDisabled(function () {
                    return !_canUseMemberFilter();
                }),
            from: new TaskListFilterConstructorFactory.MemberFilter('from')
                .withAfterGoFilteredMenu(function () {
                    allFilters.fromMeCheckBox.init();
                })
                .withIsDisabled(function () {
                    return !_canUseMemberFilter();
                }),
            state: new TaskListFilterConstructorFactory.StateFilter()
                .withAfterGoFilteredMenu(function () {
                    allFilters.userNotClosedCheckBox.init();
                    allFilters.taskNotClosedCheckBox.init();
                }),
            dueDate: new TaskListFilterConstructorFactory.DueDateFilter()
                .withAfterGoFilteredMenu(function () {
                    allFilters.overdueCheckBox.init();
                }),
            milestone: new TaskListFilterConstructorFactory.MilestoneFilter()
                .withIsDisabled(function () {
                    return !StateParamsUtil.getProjectCodeFilter();
                }),
            tags: new TaskListFilterConstructorFactory.TagFilter()
                .withIsDisabled(function () {
                    return !StateParamsUtil.getProjectCodeFilter();
                }),
            toMeCheckBox: new TaskListFilterConstructorFactory.CheckBoxFilter('to')
                .withAfterGoFilteredMenu(function () {
                    allFilters.to.init();
                    allFilters.userNotClosedCheckBox.init();
                    allFilters.taskNotClosedCheckBox.init();
                })
                .withIsDisabled(function () {
                    return !_canUseMemberFilter();
                }),
            fromMeCheckBox: new TaskListFilterConstructorFactory.CheckBoxFilter('from')
                .withAfterGoFilteredMenu(function () {
                    allFilters.from.init();
                })
                .withIsDisabled(function () {
                    return !_canUseMemberFilter();
                }),
            overdueCheckBox: new TaskListFilterConstructorFactory.CheckBoxFilter('dueDate')
                .withAfterGoFilteredMenu(function () {
                    allFilters.dueDate.init();
                }),
            userNotClosedCheckBox: new TaskListFilterConstructorFactory.CheckBoxFilter('userWorkflowClass')
                .withAfterGoFilteredMenu(function () {
                    allFilters.state.init();
                }),
            taskNotClosedCheckBox: new TaskListFilterConstructorFactory.CheckBoxFilter('postWorkflowClass')
                .withAfterGoFilteredMenu(function () {
                    allFilters.state.init();
                })
        }, allFilterParamKeys = ['postWorkflowClass', 'userWorkflowClass', 'from', 'to', 'cc', 'dueDate', 'milestone', 'tags'];

        var allFilterParamNameMap = {
            to: function () {
                return TaskListFilterConstructorFactory.MemberFilter.getDisplayName('to');
            },
            cc: function () {
                return TaskListFilterConstructorFactory.MemberFilter.getDisplayName('cc');
            },
            from: function () {
                return TaskListFilterConstructorFactory.MemberFilter.getDisplayName('from');
            },
            postWorkflowClass: function () {
                return TaskListFilterConstructorFactory.StateFilter.getDisplayName('postWorkflowClass');
            },
            userWorkflowClass: function () {
                return TaskListFilterConstructorFactory.StateFilter.getDisplayName('userWorkflowClass');
            },
            dueDate: function () {
                return TaskListFilterConstructorFactory.DueDateFilter.getDisplayName();
            },
            milestone: function () {
                return TaskListFilterConstructorFactory.MilestoneFilter.getDisplayName();
            },
            tags: function () {
                return TaskListFilterConstructorFactory.TagFilter.getDisplayName();
            }
        };

        var dummyFilterInstance = new TaskListFilterConstructorFactory.ListFilterSuperClass();
        var flags = {
            showFilterMenus: false
        };

        return {
            filters: allFilters,
            allFilterParamKeys: allFilterParamKeys,

            // method
            getShowFilterMenus: getShowFilterMenus,
            setShowFilterMenus: setShowFilterMenus,
            hasFilterParam: hasFilterParam,
            getDisplayFilterNames: getDisplayFilterNames,
            resetFilterParam: resetFilterParam,
            fetchMilestones: TaskListFilterConstructorFactory.MilestoneFilter.fetchMilestones,
            fetchTags: TaskListFilterConstructorFactory.TagFilter.fetchTags,
            showUserWorkflowClassMenu: TaskListFilterConstructorFactory.CheckBoxFilter.showUserWorkflowClassMenu
        };

        function _canUseMemberFilter() {
            if (!$state.includes(PROJECT_STATE_NAMES.PROJECT_BOX)) {
                return true;
            }
            return PermissionFactory.canUseFilterMember(StateParamsUtil.getProjectCodeFilter());
        }

        function getShowFilterMenus() {
            return flags.showFilterMenus;
        }

        function setShowFilterMenus(showFilterMenus) {
            flags.showFilterMenus = showFilterMenus;
        }

        function hasFilterParam() {
            var filteredParamKeys = _.intersection(allFilterParamKeys, _.keys($state.params));
            return _.find(filteredParamKeys, function (key) {
                return $state.params[key] && $state.params[key] !== 'all';
            });
        }

        function getDisplayFilterNames() {
            var filterKeys = _.intersection(allFilterParamKeys, _.keys($state.params));
            return $q.all(_.map(filterKeys, function (key) {
                var nameOrPromise = allFilterParamNameMap[key]();
                return HelperPromiseUtil.isPromiseLike(nameOrPromise) ? nameOrPromise : $q.when(nameOrPromise);
            })).then(function (datas) {
                return _(datas).filter().join(', ');
            });
        }

        function resetFilterParam() {
            var param = _.cloneDeep($state.params);

            _.forEach(allFilterParamKeys, function (key) {
                param[key] = param[key] && _.endsWith(key, 'WorkflowClass') ? 'all' : null;
            });

            dummyFilterInstance.goFilteredList(param);
        }


    }

    /* @ngInject */
    function TaskListFilterConstructorFactory($q, $state, PROJECT_STATE_NAMES, CommonItemList, HelperConfigUtil, Member, MilestoneBiz, StateParamsUtil, TagBiz, TaskListMenuFactory, TaskSearchParamStorage, TaskListOrderService, gettextCatalog, _) {
        var myOrgId = HelperConfigUtil.orgMemberId(),
            milestones = [],
            tags = [],
            memberCacheMap = {};

        var ListFilterSuperClass = angular.element.inherit({
            init: function () {
                this.selected = null;
                this.disabled = this.isDisabled();
            },
            selectMenu: angular.noop,
            goFilteredList: function (_params) {
                var goFilteredList = $state.includes(PROJECT_STATE_NAMES.SEARCH_BOX) ? goFilteredListInSearch : goFilteredListInTask;
                goFilteredList.call(this, _params);
            },
            removeFilter: function (key, callback) {
                callback = callback || angular.noop;
                var params = {};
                params[key] = null;

                this.selected = null;
                callback(params);
                this.goFilteredList(params);
            },
            withIsDisabled: function (callback) {
                this.isDisabled = callback;
                return this;
            },
            withAfterGoFilteredMenu: function (callback) {
                this.afterGoFilteredMenu = callback;
                return this;
            },
            isDisabled: angular.noop,
            afterGoFilteredMenu: angular.noop
        }, {
            getDisplayName: function () {
                return '';
            }
        });

        var MemberFilter = angular.element.inherit(ListFilterSuperClass, {
            __constructor: function (paramKey) {
                this.paramKey = paramKey;
            },
            init: function () {
                var self = this;
                this.__base();
                getMemberNamePromise($state.params[this.paramKey]).then(function (name) {
                    self.selected = name;
                    self.model = self.selected;
                });
            },
            selectMenu: function (item) {
                var params = {};
                memberCacheMap[item.id] = item;
                this.selected = item.name;
                params[this.paramKey] = (item.id === myOrgId ? 'me' : item.id);

                if (this.paramKey === 'to') {
                    toggleWorkflowFilter(params);
                }
                this.goFilteredList(params);
            },
            removeFilter: function () {
                var self = this;
                this.model = null;
                this.__base(this.paramKey, function (params) {
                    if (self.paramKey === 'to') {
                        toggleWorkflowFilter(params);
                    }
                });
            }
        }, {
            keyNameMap: {
                from: gettextCatalog.getString('발신'),
                to: gettextCatalog.getString('담당'),
                cc: gettextCatalog.getString('참조')
            },
            getDisplayName: function (key) {
                var self = this;
                return getMemberNamePromise($state.params[key]).then(function (memberName) {
                    return memberName ? [self.keyNameMap[key], ': ', memberName].join('') : '';
                });
            }
        });

        var StateFilter = angular.element.inherit(ListFilterSuperClass, {
            __constructor: function () {
                this.paramKey = showUserWorkflowClassMenu() ? 'userWorkflowClass' : 'postWorkflowClass';
            },
            init: function () {
                this.__base();
                this.menus = showUserWorkflowClassMenu() ?
                    TaskListMenuFactory.getUserWorkflowFilterMenus() :
                    TaskListMenuFactory.getTaskWorkflowFilterMenus();
                this.paramKey = _.keys(this.menus[0].filter)[0];
                this.selected = [];
                this.initMultiSelectFilter();
                this.showMenus = false;
            },
            selectMenu: function (menu) {
                var params = {};
                var paramValue = this.getMultiSelectedParamValue(menu);
                this.initMultiSelectFilter(paramValue);
                params[this.paramKey] = paramValue;
                this.goFilteredList(params);
            },
            getMultiSelectedParamValue: function (selectedMenu) {
                if (_.isEmpty(this.selected) ||
                    _.get(selectedMenu, 'filter', {})[this.paramKey] === 'all' ||
                    (this.selected.length === this.menus.length - 1)) {
                    return 'all';
                }

                var paramValue = _.map(this.selected, 'filter.' + this.paramKey).join(',');
                return _.includes(paramValue, 'all') ? paramValue.substring(4) : paramValue;
            },
            initMultiSelectFilter: function (value) {
                var self = this;
                value = value || $state.params[this.paramKey] || 'all';

                _.forEach(this.menus, function (menu) {
                    menu.selected = _.includes(value, menu.filter[self.paramKey]);
                });
            },
            openMenus: function () {
                this.showMenus = true;
            },
            closeMenus: function () {
                this.showMenus = false;
            }
        }, {
            codeNameMap: {
                'all': '',
                'registered': gettextCatalog.getString('등록'),
                'working': gettextCatalog.getString('진행'),
                'closed': gettextCatalog.getString('완료'),
                'registered,working': gettextCatalog.getString('완료 제외'),
                'working,closed': gettextCatalog.getString('등록 제외'),
                'registered,closed': gettextCatalog.getString('진행 제외')
            },
            getDisplayName: function (key) {
                var paramValue = $state.params[key];
                return this.codeNameMap[paramValue];
            }
        });

        var DueDateFilter = angular.element.inherit(ListFilterSuperClass, {
            init: function () {
                var self = this;
                this.__base();
                this.menus = TaskListMenuFactory.getDueDateMenus();
                initFilterMenus(this.menus, function (menu) {
                    self.selected = menu.name;
                });
            },
            selectMenu: function (menu) {
                var params = _.assign({dueDate: null}, menu.filter);
                this.selected = menu.name;
                this.goFilteredList(params);
            }
        }, {
            codeNameMap: {
                'all': '',
                'overdue': gettextCatalog.getString('지남'),
                'undue': gettextCatalog.getString('이전'),
                'unplanned': gettextCatalog.getString('미정')
            },
            getDisplayName: function () {
                var paramValue = $state.params.dueDate;
                return paramValue && paramValue !== 'all' ? gettextCatalog.getString('완료일') + ': ' + this.codeNameMap[paramValue] : '';
            }
        });

        var MilestoneFilter = angular.element.inherit(ListFilterSuperClass, {
            init: function () {
                this.__base();
                this.selected = $state.params.milestone;
                this.menus = milestones;
            },
            selectMenu: function (item) {
                var params = {milestone: item.id};
                this.goFilteredList(params);
            },
            removeFilter: function () {
                this.__base('milestone');
            }
        }, {
            fetchMilestones: fetchMilestones,
            getDisplayName: function () {
                return $state.params.milestone &&
                    gettextCatalog.getString('마일스톤') + ': ' + _.get(_.find(milestones, {'id': $state.params.milestone}), 'name');
            }
        });

        var TagFilter = angular.element.inherit(ListFilterSuperClass, {
            init: function () {
                this.__base();
                this.selected = [];
                this.tagIdList = [];
                this.tagOperator = this.tagOperator || 'and';

                if ($state.params.tags) {
                    var tagFilters = $state.params.tags.split(',');
                    this.tagOperator = _.first(tagFilters);
                    this.tagIdList = _.drop(tagFilters);
                }

                this.fetchList();
            },
            goState: function () {
                var selected = _.map(this.selected, 'id').join(','),
                    params = {tags: selected ? this.tagOperator + ',' + selected : null};
                this.goFilteredList(params);
            },
            selectMenu: function (item) {
                TagBiz.applyIcon(item, this.menus);
                this.goState();
            },
            selectTagOperator: function (op) {
                this.tagOperator = op;
                if (!_.isEmpty(this.selected)) {
                    this.goState();
                }
            },
            fetchList: function () {
                var self = this;

                TagBiz.getTagsForMultiSelect(StateParamsUtil.getProjectCodeFilter(), this.tagIdList).then(function (tags) {
                    self.menus = tags;
                });
            },
            removeFilter: function () {
                this.__base('tags');
                this.tagIdList = [];
                this.fetchList();
            }
        }, {
            fetchTags: fetchTags,
            getDisplayName: function () {
                return $state.params.tags &&
                    gettextCatalog.getString('태그') + ': ' +
                    _($state.params.tags.split(','))
                        .drop()
                        .map(function (tagId) {
                            return _.get(_.find(tags, {'id': tagId}), 'name');
                        }).join('/');
            }
        });

        var CheckBoxFilter = angular.element.inherit(ListFilterSuperClass, {
            __constructor: function (paramKey) {
                this.paramKey = paramKey;
            },
            init: function () {
                this.__base();
                this.selected = $state.params[this.paramKey];
            },
            selectMenu: function () {
                var params = {};
                params[this.paramKey] = this.selected;

                if (this.paramKey === 'to') {
                    toggleWorkflowFilter(params);
                }

                this.goFilteredList(params);
            }
        }, {
            showUserWorkflowClassMenu: showUserWorkflowClassMenu
        });

        function goFilteredListInTask(_params) {
            var params = {
                order: TaskListOrderService.data.currentValue
            };
            _.assign(params, $state.params, _params);
            params.page = 1;
            TaskSearchParamStorage.save(params);
            CommonItemList.stateGoWithoutReload('.', params);
            this.afterGoFilteredMenu(_params);
        }

        function goFilteredListInSearch(_params) {
            _params = _.assign({}, $state.params, _params);
            _params.page = 1;

            var target = $state.includes('**.view') ? '^' : '.';

            CommonItemList.stateGoWithoutReload(target, _params);
            this.afterGoFilteredMenu(_params);
        }

        function getMemberNamePromise(memberId) {
            if (!memberId || memberId === 'all') {
                return $q.when(null);
            }
            memberId = memberId === 'me' ? myOrgId : memberId;
            if (memberCacheMap[memberId]) {
                return $q.when(memberCacheMap[memberId].name);
            }

            return Member.getByMemberId(memberId).then(function (result) {
                var member = result.contents();
                memberCacheMap[member.id] = member;
                return member.name;
            });
        }

        function toggleWorkflowFilter(params) {
            params.userWorkflowClass = $state.params.postWorkflowClass || null;
            params.postWorkflowClass = $state.params.userWorkflowClass || null;

            if ($state.includes(PROJECT_STATE_NAMES.CC_BOX) && params.userWorkflowClass && params.userWorkflowClass !== 'all') {
                params.postWorkflowClass = 'all';
            } else if (params.userWorkflowClass === 'all') {
                params.userWorkflowClass = null;
            }
        }

        function fetchMilestones() {
            return MilestoneBiz.getMilestonesForDropdown(StateParamsUtil.getProjectCodeFilter()).then(function (result) {
                milestones = result.contents();
                milestones.splice(0, 1, {
                    _displayName: ['(', gettextCatalog.getString('없음'), ')'].join(''),
                    name: ['(', gettextCatalog.getString('없음'), ')'].join(''),
                    id: 'none'
                });
                return result.contents();
            });
        }

        function fetchTags() {
            return TagBiz.getTags(StateParamsUtil.getProjectCodeFilter()).then(function (result) {
                tags = result.contents();
                return result;
            });
        }

        function showUserWorkflowClassMenu() {
            var toAttribute = $state.params.to;
            return (toAttribute && toAttribute !== 'all') || $state.includes(PROJECT_STATE_NAMES.TO_BOX);
        }

        function initFilterMenus(menus, callback) {
            var filter, key, selected;
            _.forEach(menus, function (menu) {
                filter = menu.filter;
                key = _.keys(filter)[0];
                if ($state.params[key] === filter[key]) {
                    menu.selected = true;
                    selected = true;
                    callback(menu);
                }
            });

            if (!selected && !_.isEmpty(menus)) {
                callback(menus[0]);
                menus[0].selected = true;
            }
        }

        return {
            ListFilterSuperClass: ListFilterSuperClass,
            MemberFilter: MemberFilter,
            StateFilter: StateFilter,
            DueDateFilter: DueDateFilter,
            MilestoneFilter: MilestoneFilter,
            TagFilter: TagFilter,
            CheckBoxFilter: CheckBoxFilter
        };
    }

})();
