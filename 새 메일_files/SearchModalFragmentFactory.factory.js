(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('SearchModalFragmentFactory', SearchModalFragmentFactory);

    /* @ngInject */
    function SearchModalFragmentFactory($q, DisplayBoxUtil, HelperConfigUtil, Project, TaskListBiz, TaskQuickSearchStorage, gettextCatalog, _) {
        var templateUrlPrefix = 'modules/components/SearchModalFactory/SearchModalFragmentFactory/ui-templates/',
            MAX_ITEM_SIZE_IN_GROUP = 20;

        var SearchModalFragmentBuilder = angular.element.inherit({
            __constructor: function () {
                _.assign(this, {
                    title: '',
                    templateUrl: '',
                    params: {},
                    init: function () { return $q.when([]); },
                    search: function () { return $q.when([]); },
                    validate: angular.noop
                });
            },
            withTitle: function (title) {
                this.title = title;
                return this;
            },
            withTemplateUrl: function (templateUrl) {
                this.templateUrl = templateUrlPrefix + templateUrl;
                return this;
            },
            withInitFunc: function (initFunc) {
                this.init = initFunc;
                return this;
            },
            withSearchFunc: function (searchFunc) {
                this.search = searchFunc;
                return this;
            },
            withValidateFunc: function (validateFunc) {
                this.validate = validateFunc;
                return this;
            },
            withParams: function (params) {
                this.params = params;
                return this;
            }
        });

        function concatProjects(fetchPrivateList, fetchPublicList, organizationId) {
            return fetchPrivateList(organizationId).then(function (result) {
                return $q.when(result.contents());
            }).then(function (projects) {
                return fetchPublicList(organizationId).then(function (result) {
                    projects = _(projects).concat(result.contents()).uniqBy('id').value();
                    _.forEach(projects, function (project) {
                        project._scopeName = DisplayBoxUtil.makeScopeFullName(project.scope);
                    });

                    return $q.when(projects);
                });
            });
        }

        var searchOnProjectForMovingProject = new SearchModalFragmentBuilder()
            .withTitle(gettextCatalog.getString('프로젝트함'))
            .withTemplateUrl('projectBtnFragmentTpl.html')
            .withInitFunc(function (selectedTask) {
                var self = this;
                return concatProjects(Project.fetchMyActiveList, Project.fetchActivePublicList, selectedTask.data.organizationId).then(function (projects) {
                    var wrapped = _(projects).map(function (project) {
                        project._name = project.code;
                        return project;
                    }).filter(function (project) {
                        return project.code !== _.get(selectedTask, 'data.projectCode');
                    });

                    self._allProjects = wrapped.value();
                    if (_.get(selectedTask, 'data.users.me.member.organizationMemberId') === _.get(selectedTask, 'data.users.from.member.organizationMemberId')) {
                        //개인코드는 목록에 직접 추가 (자신이 보낸사람 일 때만 노출)
                        self._allProjects.unshift(HelperConfigUtil.myProjectItem());
                    }

                    return $q.when(_.take(self._allProjects, MAX_ITEM_SIZE_IN_GROUP));
                });
            })
            .withSearchFunc(function (keyword) {
                return $q.when(filterList(this._allProjects, function (project) {
                    return _.includes(project.code && project.code.toLowerCase(), keyword && keyword.toLowerCase());
                }));
            });

        var searchOnProject = new SearchModalFragmentBuilder()
            .withTitle(gettextCatalog.getString('프로젝트함으로 바로 가기'))
            .withTemplateUrl('projectAnchorFragmentTpl.html')
            .withInitFunc(function () {
                var self = this;
                concatProjects(Project.fetchMyPrivateList, Project.fetchPublicList).then(function (projects) {
                    self._allProjects = projects;
                });
                return $q.when([]);
            })
            .withSearchFunc(function (keyword) {
                return $q.when(filterList(this._allProjects, function (project) {
                    return _.includes(project.code && project.code.toLowerCase(), keyword && keyword.toLowerCase());
                }));
            });

        var searchOnRecentTask = new SearchModalFragmentBuilder()
            .withTitle(gettextCatalog.getString('최근 본 업무'))
            .withTemplateUrl('storageResultAnchorFragmentTpl.html')
            .withInitFunc(function (selectedTask) {
                var recentTasks = TaskQuickSearchStorage.getRecentTasks(selectedTask.param.projectCode, selectedTask.param.postNumber);
                return $q.when(recentTasks);
            })
            .withSearchFunc(function (keyword) {
                return $q.when(_.take(TaskQuickSearchStorage.search(keyword), MAX_ITEM_SIZE_IN_GROUP));
            });

        var searchByQuery = new SearchModalFragmentBuilder()
            .withTitle(gettextCatalog.getString('검색 결과'))
            .withParams({
                page: 0,
                size: MAX_ITEM_SIZE_IN_GROUP,
                scope: 3, //all task
                highlight: true
            })
            .withTemplateUrl('apiResultAnchorFragmentTpl.html')
            .withSearchFunc(function (keyword) {
                var params = this.params;
                params.subject = [keyword];
                return TaskListBiz.fetchListBySearchV2(params).then(function (result) {
                    var postList = _.map(result.contents(), function(postMetaData) {
                        var post = result.refMap.postMap(postMetaData.postId);
                        post.projectCode = result.refMap.projectMap(post.projectId).code;
                        return post;
                    });
                    return $q.when(postList);
                });
            });

        var searchOnRecentTaskForMovingSubPost = new SearchModalFragmentBuilder()
            .withTitle(gettextCatalog.getString('최근 본 업무'))
            .withTemplateUrl('storageResultBtnFragmentTpl.html')
            .withInitFunc(function (selectedTask) {
                var self = this;
                this._recentTasks = TaskQuickSearchStorage.searchInProject(_.get(selectedTask, 'param.projectCode'));
                return $q.when(filterList(this._recentTasks, function (task) {
                    return self.validate(task);
                }));
            })
            .withSearchFunc(function (keyword) {
                var self = this;
                return $q.when(filterList(this._recentTasks, function (task) {
                    return _.includes(task.taskName, keyword) && self.validate(task);
                }));
            });

        var searchBySubjectForMovingSubPost = _.cloneDeep(searchByQuery)
            .withTemplateUrl('apiResultBtnFragmentTpl.html');

        function filterList(list, isMatch) {
            return _(list)
                .filter(function (item) {
                    return isMatch(item);
                })
                .take(MAX_ITEM_SIZE_IN_GROUP)
                .value();
        }

        return {
            MAX_ITEM_SIZE_IN_GROUP: MAX_ITEM_SIZE_IN_GROUP,
            searchOnProjectForMovingProject: searchOnProjectForMovingProject,
            searchOnRecentTaskForMovingSubPost: searchOnRecentTaskForMovingSubPost,
            searchBySubjectForMovingSubPost: searchBySubjectForMovingSubPost,
            searchOnProject: searchOnProject,
            searchOnRecentTask: searchOnRecentTask,
            searchByQuery: searchByQuery
        };
    }

})();
