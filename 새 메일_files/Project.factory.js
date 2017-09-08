(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .constant('PROJECT_API_PARAM_NAMES', {
            SCOPE: {
                PUBLIC: 'public',
                PRIVATE: 'private'
            },
            PUBLIC_SCOPE_PERMISSIONS: {
                ALL: ['list_read', 'write', 'update_delete'],
                WRITE_ONLY: ['write']
            },
            STATE: {
                ACTIVE: 'active',
                ARCHIVED: 'archived',
                TRASHED: 'trashed',
                DELETED: 'deleted'
            },
            EXT_FIELDS: {
                MEMBERS: 'members',
                COUNTS: 'counts' // 사용시에 https://nhnent.dooray.com/project/projects/Dooray-obt/2610 이슈 확인
            }
        })
        .factory('ProjectResource', ProjectResource)
        .factory('ProjectParamBuilder', ProjectParamBuilder)
        .factory('Project', Project);

    /* @ngInject */
    function ProjectResource($cacheFactory, $resource, ApiConfigUtil) {
        var cache = $cacheFactory('ProjectResource');
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode', {
            'projectCode': '@projectCode'
        }, {
            'get': {method: 'GET', cache: cache},
            'getWithoutCache': {method: 'GET'},
            'query': {method: 'GET', isArray: true, cache: cache},
            'save': {method: 'POST'},
            'update': {method: 'PUT'},
            'setPublicPermissions': {url: ApiConfigUtil.wasContext() + '/projects/:projectCode/set-public-permissions', method: 'POST'},
            'removePublicPermissions': {url: ApiConfigUtil.wasContext() + '/projects/:projectCode/remove-public-permissions', method: 'POST'}
        });
    }

    /* @ngInject */
    function ProjectParamBuilder(API_PAGE_SIZE, PROJECT_API_PARAM_NAMES, _) {
        return angular.element.inherit({
            __constructor: function () {
                this.param = {};
            },
            _getDefaultParam: function () {
                return {
                    'member': null,
                    'state': [PROJECT_API_PARAM_NAMES.STATE.ACTIVE, PROJECT_API_PARAM_NAMES.STATE.ARCHIVED].join(','),
                    'scope': [PROJECT_API_PARAM_NAMES.SCOPE.PRIVATE, PROJECT_API_PARAM_NAMES.SCOPE.PUBLIC].join(','),
                    'extFields': null,
                    'organizationId': null,
                    'page': 0,
                    'size': API_PAGE_SIZE.ALL,
                    'projectCode': null,
                    'query': null
                };
            },
            withMember: function (member) {
                this.param.member = member;
                return this;
            },
            withState: function (state) {
                this.param.state = state || this.param.state;
                return this;
            },
            withScope: function (scope) {
                this.param.scope = scope || this.param.scope;
                return this;
            },
            withExtFields: function (extFields) {
                this.param.extFields = extFields;
                return this;
            },
            withOrganizationId: function (organizationId) {
                if(organizationId !== 'all') {
                    this.param.organizationId = organizationId;
                }
                return this;
            },
            withPageInfo: function (pageInfo) {
                this.param.page = _.get(pageInfo, 'page');
                this.param.size = _.get(pageInfo, 'size');
                return this;
            },
            withProjectCode: function (projectCode) {
                this.param.projectCode = projectCode;
                this.param.state = null;
                this.param.scope = null;
                return this;
            },
            withQuery: function (query) {
                this.param.query = query;
                return this;
            },
            withOrder: function (order) {
                this.param.order = order;
                return this;
            },
            build: function (param) {
                return _.assignWith(this._getDefaultParam(), this.param, param, function (value, other) {
                    return _.isUndefined(other) ? value : other;
                });
            }
        });
    }

    /* @ngInject */
    function Project($cacheFactory, PROJECT_API_PARAM_NAMES, ProjectParamBuilder, ProjectResource, RootScopeEventBindHelper, _) {
        var EVENTS = {
            'RESETCACHE': 'Project:resetCache'
        };

        var resetCache = function () {
            $cacheFactory.get('ProjectResource').removeAll();
            RootScopeEventBindHelper.emit(EVENTS.RESETCACHE);
        };

        return {
            EVENTS: EVENTS,
            resetCache: resetCache,
            PARAM_NAMES: PROJECT_API_PARAM_NAMES,
            fetchList: fetchList,
            fetchMyList: function (organizationId) {
                return fetchList({organizationId: organizationId, member: 'me'});
            },

            fetchByCode: function (code, extFields) {
                return getProject({projectCode: code, extFields: extFields}).$promise;
            },

            fetchAllList: function (organizationId) {
                return fetchList({organizationId: organizationId});
            },

            fetchListByMemberId: function (memberId, extFields) {
                return fetchList({member: memberId, extFields: extFields});
            },

            fetchMyActiveList: function (organizationId, extFields) {
                return fetchList({member: 'me', state: PROJECT_API_PARAM_NAMES.STATE.ACTIVE, organizationId: organizationId, extFields: extFields});
            },

            fetchMyPrivateList: function () {
                return fetchList({member: 'me', scope: PROJECT_API_PARAM_NAMES.SCOPE.PRIVATE});
            },

            fetchMyListWithParam: function (param) {
                // hooks 있었던 자리
                param = param || {};
                param.member = 'me';
                param.extFields = [PROJECT_API_PARAM_NAMES.EXT_FIELDS.COUNTS, PROJECT_API_PARAM_NAMES.EXT_FIELDS.MEMBERS].join(',');
                return fetchList(param);
            },

            fetchPublicList: function (organizationId) {
                return fetchList({organizationId: organizationId, scope: PROJECT_API_PARAM_NAMES.SCOPE.PUBLIC});
            },


            fetchActivePublicList: function (organizationId) {
                return fetchList({organizationId: organizationId, state: PROJECT_API_PARAM_NAMES.STATE.ACTIVE, scope: PROJECT_API_PARAM_NAMES.SCOPE.PUBLIC});
            },


            //params = { code : "hive", name : '1', description : '', scope : 'private' }
            add: function (params) {
                return ProjectResource.save([params]).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            },

            //projectCode = 'hive', params = { code : "hive2", name : '1', description : '' }
            update: function (projectCode, params, withoutResetCache) {
                return ProjectResource.update({'projectCode': projectCode}, params).$promise.then(function (result) {
                    if (!withoutResetCache) {
                        resetCache();
                    }
                    return result;
                });
            },

            //projectCode = 'hive', params = [{ organizationId : "1", permission: ['list_read', 'write', 'update_delete' }]
            setPublicPermissions: function (projectCode, params) {
                return ProjectResource.setPublicPermissions({'projectCode': projectCode}, params).$promise;
            },

            //projectCode = 'hive', , params = [{ organizationId : "1"}]
            removePublicPermissions: function (projectCode, params) {
                return ProjectResource.removePublicPermissions({'projectCode': projectCode}, params).$promise;
            }
        };

        function getProject(params) {
            if (_.includes(params.extFields, 'counts')) {
                return ProjectResource.getWithoutCache(params);
            }

            return ProjectResource.get(params);
        }

        // option: {member, state, scope, extFields, organizationId, pageInfo, page, size, query}
        function fetchList(option) {
            option = option || {};
            var param = new ProjectParamBuilder()
                .withMember(option.member)
                .withState(option.state)
                .withScope(option.scope)
                .withExtFields(option.extFields)
                .withOrganizationId(option.organizationId)
                .withPageInfo(option.pageInfo || {page: option.page, size: option.size})
                .withQuery(option.query)
                .withOrder(option.order)
                .build();
            return getProject(param).$promise;
        }
    }
})();
