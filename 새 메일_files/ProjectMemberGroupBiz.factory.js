(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('ProjectMemberGroupResource', ProjectMemberGroupResource)
        .factory('ProjectMemberGroupBiz', ProjectMemberGroupBiz);


    /* @ngInject */
    function ProjectMemberGroupResource($cacheFactory, $resource, ApiConfigUtil) {
        var cache = $cacheFactory('ProjectMemberGroupResource');
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/project-member-groups/:projectMemberGroupId', {
            'projectCode': '@projectCode',
            'projectMemberGroupId': '@projectMemberGroupId'
        }, {
            'queryWithoutCache': {method: 'GET'},
            'query': {method: 'GET', cache: cache},
            'get': {method: 'GET', cache: cache},
            'save': {
                url: ApiConfigUtil.wasContext() + '/projects/:projectCode/project-member-groups',
                method: 'POST'
            },
            'update': {method: 'PUT'},
            'remove': {method: 'DELETE'}
        });
    }

    /* @ngInject */
    function ProjectMemberGroupBiz($cacheFactory, API_PAGE_SIZE, ProjectMemberGroupResource, RootScopeEventBindHelper) {
        var EVENTS = {
            'RESETCACHE': 'ProjectMemberGroup:resetCache'
        };

        var resetCache = function () {
            $cacheFactory.get('ProjectMemberGroupResource').removeAll();
            RootScopeEventBindHelper.emit(EVENTS.RESETCACHE);
        };
        return {
            EVENTS: EVENTS,
            resetCache: resetCache,

            fetchListByCode: function (projectCode, ids) {
                return this.fetchList({projectCode: projectCode, size: API_PAGE_SIZE.ALL, ids: ids});
            },

            fetchListAll: function () {
                return this.fetchList({projectCode: '*', size: API_PAGE_SIZE.ALL});
            },

            fetchList: function (param) {
                return ProjectMemberGroupResource.query(param).$promise;
            },

            fetchListWithoutCache: function (param) {
                return ProjectMemberGroupResource.queryWithoutCache(param).$promise;
            },

            fetch: function (param) {
                return ProjectMemberGroupResource.get(param).$promise;
            },

            add: function (param, submitData) {
                return ProjectMemberGroupResource.save(param, [submitData]).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            },

            update: function (param) {
                return ProjectMemberGroupResource.update(param).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            },

            remove: function (param) {
                return ProjectMemberGroupResource.remove(param).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            }
        };
    }

})();
