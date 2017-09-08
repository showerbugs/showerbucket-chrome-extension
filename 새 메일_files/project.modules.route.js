(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .run(runInitializeUiRouter);

    /* @ngInject */
    function runInitializeUiRouter(PROJECT_STATE_NAMES, Router, _) {
        registerStateInfos();

        function registerStateInfos() {
            Router.registerState({
                name: PROJECT_STATE_NAMES.PROJECT_STATE,
                url: '/project',
                views: {
                    navi: {
                        template: '<project-navi layout="column" flex></project-navi>'
                    },
                    mainContents: {
                        controller: 'TaskContentsCtrl as taskContentsCtrl',
                        templateProvider: ['$templateCache', 'ViewModeBiz', function ($templateCache, ViewModeBiz) {
                            var templateUrl = ViewModeBiz.get() === ViewModeBiz.VIEW_MODE.FULL_VIEW ?
                                'modules/layouts/main/DefaultContents/fullViewContents.html' :
                                'modules/layouts/main/DefaultContents/verticalSplitContents.html';

                            return $templateCache.get(templateUrl);
                        }]

                    },
                    'search@main.page': {
                        template: '<project-header-search></project-header-search>'
                    }
                },
                onEnter: onEnterProjectState //TODO ListBizWrapperByType, ServiceUseRouter 에서 project,mail,calendar 의존성 분리
            });

            /* @ngInject */
            function onEnterProjectState(ITEM_TYPE, ServiceUseRouter, ListBizWrapperByType, WelcomeGuideModalFactory) {
                if (!ServiceUseRouter.routeToUsingService('project')) {
                    ListBizWrapperByType.selectBizWrapper(ITEM_TYPE.POST);
                    WelcomeGuideModalFactory.openIfFirstType('project');
                }
            }

            // 임시보관함
            Router.registerState({
                name: PROJECT_STATE_NAMES.DRAFT_BOX,
                url: '/draft?{page:number}',
                data: {
                    boxFilter: {
                        draftId: null
                    },
                    defaultFullViewCols: {
                        options: {
                            checkbox: true,
                            subject: true,
                            tags: true,
                            to: true,
                            subPost: true,
                            milestone: true,
                            dueDate: true,
                            updatedAt: true
                        },
                        order: ['checkbox', 'subjectTags', 'from', 'to', 'updatedAt', 'dueDate', 'milestone']
                    }
                },
                views: {
                    boxHeader: {
                        templateUrl: 'modules/layouts/main/DefaultContents/defaultBoxHeader.html'
                    },
                    boxHeaderRight: {
                        templateUrl: 'modules/layouts/main/DefaultContents/boxHeaderRightContent.html'
                    },
                    listContentView: {
                        controller: 'DraftListCtrl',
                        templateUrl: 'modules/project/list/DraftList/draftList.html'
                    },
                    detailContentView: {
                        templateUrl: 'modules/layouts/view/emptyView.html'
                    }
                }
            });
            Router.registerState({
                name: PROJECT_STATE_NAMES.DRAFT_BOX_VIEW,
                url: '/:draftId',
                views: {
                    // main.task의 detailContentView를 재정의
                    'detailContentView@main.page.project': {
                        controller: 'DraftViewCtrl',
                        templateUrl: 'modules/project/view/draft/draftView.html'
                    }
                }
            });

            Router.registerState(_.assign({
                    name: PROJECT_STATE_NAMES.SEARCH_BOX,
                    reloadOnSearch: false,
                    url: '/search?{page:int}{size:int}' +
                    '{query:string}{projectCodeFilter:nonURIEncoded}{scope:string}' + // 검색 조건
                    '{to:string}{cc:string}{from:string}{hasParent:string}{userWorkflowClass:string}{postWorkflowClass:string}{milestone:string}{tags:string}', // 필터 변수
                    params: {
                        page: 1
                    },
                    data: {
                        filters: ['to', 'cc', 'from', 'state', /*'dueDate', */'toMeCheckBox', 'fromMeCheckBox', /*'overdueCheckBox', */'userNotClosedCheckBox', 'taskNotClosedCheckBox', 'milestone', 'tags'],
                        noItemMessage: '검색 결과가 없습니다.',
                        isContentList: true
                    }
                }, makeContentViewStateTemplate(PROJECT_STATE_NAMES.SEARCH_BOX, 'postWithContent', {
                    boxHeaderTemplateUrl: 'modules/layouts/main/DefaultContents/searchBoxHeader.html',
                    listContentViewController: 'TaskSearchListCtrl',
                    onEnterAction: {resourceName: 'TaskSearchResource', methodName: 'searchV2'}
                })
            ));
            Router.registerState({
                name: PROJECT_STATE_NAMES.SEARCH_BOX_VIEW,
                url: '/{projectCode:nonURIEncoded}/{postNumber:int}?{commentId:string}{onlyPost:string}',
                views: {
                    // main.task의 detailContentView를 재정의
                    'detailContentView@main.page.project.search': {
                        controller: 'TaskViewCtrl',
                        templateUrl: 'modules/project/view/taskView.html'
                    }
                }
            });

            var TaskListStateBuilder = function (name, url) {
                var state = {
                    name: name,
                    url: url,
                    reloadOnSearch: false,
                    params: {filterStoreMode: false, focusEventId: null},
                    data: {
                        boxFilter: {
                            projectCode: function (params) {
                                return params.projectCodeFilter || '*';
                            }
                        },
                        defaultFullViewCols: {
                            options: {
                                checkbox: true,
                                star: true,
                                postBadge: true,
                                postCode: true,
                                subject: true,
                                tags: true,
                                from: true,
                                to: true,
                                priority: true,
                                subPost: true,
                                milestone: true,
                                dueDate: true,
                                createdAt: true
                            },
                            order: ['checkbox', 'star', 'postCode', 'postBadge', 'subjectTags', 'from', 'to', 'priority', 'createdAt', 'dueDate', 'milestone']
                        },
                        defaultOrder: '-postUpdatedAt',
                        defaultParams: {},
                        workflowBadge: 'task',
                        dueDateMenus: [],
                        orders: [],
                        actionButtons: {
                            read: true
                        },
                        // filters: 'to', 'cc', 'from', 'state', 'dueDate', 'toMeCheckBox', 'fromMeCheckBox', 'overdueCheckBox', 'userNotClosedCheckBox', 'taskNotClosedCheckBox', 'milestone', 'tags'
                        filters: ['state', 'dueDate', 'overdueCheckBox', 'userNotClosedCheckBox', 'taskNotClosedCheckBox'],
                        listItemTemplate: 'with-from-item.html'
                    },
                    views: {
                        boxHeader: {
                            templateUrl: 'modules/layouts/main/DefaultContents/defaultBoxHeader.html'
                        },
                        boxHeaderRight: {
                            templateUrl: 'modules/layouts/main/DefaultContents/boxHeaderRightContent.html'
                        },
                        listContentView: {
                            controller: 'TaskListCtrl',
                            templateUrl: 'modules/project/list/TaskList/postList.html'
                        },
                        detailContentView: {
                            templateUrl: 'modules/layouts/view/emptyView.html'
                        }
                    }
                };
                return {
                    withParams: function (params) {
                        angular.extend(state.params, params);
                        return this;
                    },
                    withDefalutOrder: function (defaultOrder) {
                        state.data.defaultOrder = defaultOrder;
                        return this;
                    },
                    withDefaultParams: function (filter) {
                        state.data.defaultParams = filter;
                        return this;
                    },
                    withBoxFilter: function (boxFilter) {
                        _.assign(state.data.boxFilter, boxFilter);
                        return this;
                    },
                    withListItemTemplate: function (templateUrl) {
                        state.data.listItemTemplate = templateUrl;
                        return this;
                    },
                    withWorkflowBadge: function (badgeInfo) {
                        state.data.workflowBadge = badgeInfo;
                        return this;
                    },
                    withNoItemMessage: function (message) {
                        state.data.noItemMessage = message;
                        return this;
                    },
                    withActionButtons: function (buttons) {
                        state.data.actionButtons = buttons;
                        return this;
                    },
                    withFilters: function (includeFilters) {
                        state.data.filters = state.data.filters.concat(includeFilters);
                        return this;
                    },
                    withFullViewOptions: function (options) {
                        _.assign(state.data.defaultFullViewCols.options, options);
                        return this;
                    },
                    withBoxHeaderView: function (templateUrl, controllerName) {
                        var boxHeader = state.views.boxHeader;
                        boxHeader.templateUrl = templateUrl || boxHeader.templateUrl;
                        boxHeader.controller = controllerName || boxHeader.controller;
                        return this;
                    },
                    withViews: function (views) {
                        state.views = views;
                        return this;
                    },
                    withOnEnter: function (onEnter) {
                        state.onEnter = onEnter;
                        return this;
                    },
                    withOnExit: function (onExit) {
                        state.onExit = onExit;
                        return this;
                    },
                    withContentList: function (stateName, bizName, option) {
                        _.assign(state, makeContentViewStateTemplate(stateName, bizName, option));
                        state.data.isContentList = true;
                        return this;
                    },
                    build: function () {
                        state.url += state.url.indexOf('?') > -1 ? '' : '?';
                        state.url += '{projectCodeFilter:nonURIEncoded}' +     // list 범위
                            '{order:string}{to:string}{cc:string}{from:string}{dueDate:string}{hasParent:string}{userWorkflowClass:string}{postWorkflowClass:string}{projectIds:string}' + // filter
                            '{page:int}';
                        Router.registerState(state);
                        return this;
                    },
                    buildView: function (paramString, overridingViewsName) {
                        var viewState = {
                            name: state.name + '.view',
                            url: '/{projectCode:nonURIEncoded}/{postNumber:int}' + (paramString ? '?' + paramString : ''),
                            views: {},
                            reloadOnSearch: false
                        };
                        // main.task의 detailContentView를 재정의
                        viewState.views[overridingViewsName || 'detailContentView@main.page.project'] = {
                            controller: 'TaskViewCtrl',
                            templateUrl: 'modules/project/view/taskView.html'
                        };
                        Router.registerState(viewState);
                        return this;
                    }
                };
            };


            /**
             * 수신함 - 담당 업무
             * 탭 : 전체(등록,진행,완료) / 완료제외
             * 정렬 : 완료일(기본) / 등록일 / 업무상태 / 업데이트
             */

            new TaskListStateBuilder(PROJECT_STATE_NAMES.TO_BOX, '/to?{read:string}')
                .withBoxFilter({
                    to: 'me'
                })
                .withDefalutOrder('postDueAt')
                .withFullViewOptions({to: false})
                .withActionButtons({read: true, complete: true})
                .withDefaultParams({userWorkflowClass: 'registered,working'})
                .withWorkflowBadge('me')
                .withFilters(['cc', 'from', 'fromMeCheckBox'])
                .withNoItemMessage('처리해야 할 업무가 없습니다.')
                .build()
                .buildView();

            new TaskListStateBuilder(PROJECT_STATE_NAMES.CC_BOX, '/cc?{read:string}')
                .withBoxFilter({
                    cc: 'me'
                })
                //.withListItemTemplate('name-subject-to-item.html')
                .withDefalutOrder('-createdAt')
                .withFullViewOptions({to: false})
                .withDefaultParams({postWorkflowClass: 'registered,working'})
                .withFilters(['to', 'from', 'fromMeCheckBox'])
                .withNoItemMessage('지켜봐야 할 업무가 없습니다.')
                .build()
                .buildView();

            new TaskListStateBuilder(PROJECT_STATE_NAMES.SENT_BOX, '/sent')
                .withBoxFilter({from: 'me'})
                .withDefalutOrder('-createdAt')
                .withFullViewOptions({from: false})
                .withFilters(['to', 'cc', 'toMeCheckBox'])
                .withListItemTemplate('with-to-item.html')
                .withNoItemMessage('요청한 업무가 없습니다.')
                .withActionButtons({read: true, remove: true})
                .build()
                .buildView();

            new TaskListStateBuilder(PROJECT_STATE_NAMES.PROJECT_BOX, '/projects?{type:string}{milestone:string}{tags:string}')
                .withListItemTemplate('with-to-item.html')
                .withBoxFilter({
                    projectCode: function (params) {
                        return params.projectCodeFilter || params.projectCode;
                    }
                })
                .withDefalutOrder('-postUpdatedAt')
                .withFullViewOptions({postCode: false, postNumber: true})
                .withFilters(['to', 'cc', 'from', 'toMeCheckBox', 'fromMeCheckBox', 'milestone', 'tags'])
                .withNoItemMessage('업무가 없습니다.')
                .withBoxHeaderView('modules/project/TaskContents/projectBoxHeader.html', 'ProjectBoxHeaderCtrl')
                .withActionButtons({milestone: true, tags: true, moveProject: true})
                .withOnEnter(['$state', '$stateParams', function ($state, $stateParams) {
                    // '/project/projects' 로 접근시 방어코드
                    if ($state.params.projectCode || $stateParams.projectCode ||
                        $state.params.projectCodeFilter || $stateParams.projectCodeFilter) {
                        return;
                    }
                    $state.go(PROJECT_STATE_NAMES.TO_BOX, {}, {inherit: false, reload: PROJECT_STATE_NAMES.TO_BOX});
                }])
                .build();
            Router.registerState({
                name: PROJECT_STATE_NAMES.PROJECT_BOX_VIEW,
                url: '/{projectCode:nonURIEncoded}/{postNumber:int}',
                views: {
                    // main.task의 detailContentView를 재정의
                    'detailContentView@main.page.project': {
                        controller: 'TaskViewCtrl',
                        templateUrl: 'modules/project/view/taskView.html'
                    }
                },
                reloadOnSearch: false,
                onEnter: ['$state', '$stateParams', 'PROJECT_STATE_NAMES', function ($state, $stateParams, PROJECT_STATE_NAMES) {
                    if ($state.params.projectCodeFilter || $stateParams.projectCodeFilter) {
                        return;
                    }

                    var params = {
                        projectCode: $stateParams.projectCode,
                        postNumber: $stateParams.postNumber,
                        projectCodeFilter: $stateParams.projectCode
                    };
                    $state.go(PROJECT_STATE_NAMES.PROJECT_BOX_VIEW, params, {
                        inherit: true,
                        reload: PROJECT_STATE_NAMES.PROJECT_BOX_VIEW
                    });
                }]
            });

            Router.registerState({
                name: PROJECT_STATE_NAMES.PROJECT_BOX_VIEW_COMMENT,
                url: '/{eventId:string}',
                onEnter: ['$state', '$stateParams', 'PROJECT_STATE_NAMES', function ($state, $stateParams, PROJECT_STATE_NAMES) {
                    var params = {
                        projectCode: $stateParams.projectCode,
                        postNumber: $stateParams.postNumber,
                        projectCodeFilter: $state.params.projectCodeFilter || $stateParams.projectCodeFilter || $stateParams.projectCode,
                        focusEventId: $stateParams.eventId
                    };
                    $state.go(PROJECT_STATE_NAMES.PROJECT_BOX_VIEW, params, {
                        inherit: true,
                        reload: PROJECT_STATE_NAMES.PROJECT_BOX_VIEW
                    });
                }]
            });

            new TaskListStateBuilder(PROJECT_STATE_NAMES.IMPORTANT_BOX, '/important')
                .withBoxFilter({
                    favorited: true
                })
                .withDefalutOrder('-createdAt')
                .withFilters(['to', 'cc', 'from', 'toMeCheckBox', 'fromMeCheckBox'])
                .withNoItemMessage('업무가 없습니다.')
                .build()
                .buildView();

            new TaskListStateBuilder(PROJECT_STATE_NAMES.COMMENT_BOX, '/comment')
                .withBoxFilter({
                    from: 'me',
                    eventType: 'comment',
                    postNumber: '*'
                })
                .withFilters(['to', 'cc', 'from', 'toMeCheckBox', 'fromMeCheckBox'])
                .withNoItemMessage('댓글이 없습니다.')
                .withContentList(PROJECT_STATE_NAMES.COMMENT_BOX, 'comment')
                .build()
                .buildView('{commentId:string}', 'detailContentView@main.page.project.comment');

            new TaskListStateBuilder(PROJECT_STATE_NAMES.MENTION_BOX, '/mention?{scope:string}')
                .withParams({scope: 'all'})
                .withFilters(['to', 'cc', 'from', 'toMeCheckBox', 'fromMeCheckBox'])
                .withNoItemMessage('업무가 없습니다.')
                .withContentList(PROJECT_STATE_NAMES.MENTION_BOX, 'postWithContent', {
                    onEnterAction: {
                        resourceName: 'MentionResource',
                        methodName: 'get'
                    }
                })
                .build()
                .buildView('{onlyPost:boolean}{commentId:string}', 'detailContentView@main.page.project.mention');

            function makeContentViewStateTemplateViews(stateName, option) {
                var views = {
                    'mainContents@main.page': {
                        controller: 'TaskContentsCtrl as taskContentsCtrl',
                        templateUrl: 'modules/layouts/main/DefaultContents/verticalSplitContents.html'
                    }
                };
                views['boxHeader@' + stateName] = {
                    templateUrl: option.boxHeaderTemplateUrl || 'modules/layouts/main/DefaultContents/defaultBoxHeader.html'
                };
                views['boxHeaderRight@' + stateName] = {
                    templateUrl: 'modules/layouts/main/DefaultContents/boxHeaderRightContent.html'
                };
                views['listContentView@' + stateName] = {
                    controller: option.listContentViewController || 'TaskListCtrl',
                    templateUrl: 'modules/project/list/TaskList/postListWithContent.html'
                };
                views['detailContentView@' + stateName] = {
                    templateUrl: 'modules/layouts/view/emptyView.html'
                };
                return views;
            }

            // option: {
            //           boxHeaderTemplateUrl: 'modules/layouts/main/DefaultContents/defaultBoxHeader.html',
            //           listContentViewController: 'TaskListCtrl',
            //           onEnterAction: {
            //              resourceName: 'DummyResource'
            //              methodName: 'save'
            //           }
            //         }
            function makeContentViewStateTemplate(stateName, bizName, option) {
                option = option || {};
                return {
                    views: makeContentViewStateTemplateViews(stateName, option),
                    onEnter: ['$injector', 'ListBizWrapperByType', 'PostListWithContentBiz', 'ViewModeBiz', function ($injector, ListBizWrapperByType, PostListWithContentBiz, ViewModeBiz) {
                        ListBizWrapperByType.selectBizWrapper(bizName);
                        if (ViewModeBiz.get() === ViewModeBiz.VIEW_MODE.FULL_VIEW) {
                            ViewModeBiz.setCache(ViewModeBiz.VIEW_MODE.VERTICAL_SPLIT_VIEW);
                        }
                        if (option.onEnterAction) {
                            $injector.invoke([option.onEnterAction.resourceName, function (resource) {
                                PostListWithContentBiz.setResourceApi(resource[option.onEnterAction.methodName]);
                            }]);
                        }
                    }],
                    onExit: ['ListBizWrapperByType', 'ViewModeBiz', function (ListBizWrapperByType, ViewModeBiz) {
                        ListBizWrapperByType.selectBizWrapper('post');
                        ViewModeBiz.reloadCache();
                    }]
                };
            }
        }
    }

})();
