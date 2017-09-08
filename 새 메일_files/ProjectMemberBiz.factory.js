(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('ProjectMemberResource', ProjectMemberResource)
        .factory('ProjectMemberBiz', ProjectMemberBiz);

    /* @ngInject */
    function ProjectMemberResource($cacheFactory, $resource, ApiConfigUtil) {
        var cache = $cacheFactory('ProjectMemberResource');
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/members/:memberId', {
            projectCode: '@projectCode',
            memberId: '@memberId'
        }, {
            query: {method: 'GET', cache: cache},
            get: {method: 'GET',  cache: cache},
            getWithoutCache: {method: 'GET'},
            save: {url: ApiConfigUtil.wasContext() + '/projects/:projectCode/members',method: 'POST'},
            update: {method: 'PUT'}
        });
    }

    /* @ngInject */
    function ProjectMemberBiz($cacheFactory, API_PAGE_SIZE, ORG_MEMBER_ROLE, ProjectMemberResource, RootScopeEventBindHelper, _) {
        var EVENTS = {
            RESETCACHE: 'ProjectMember:resetCache'
        };

        var resetCache = function () {
            $cacheFactory.get('ProjectMemberResource').removeAll();
            RootScopeEventBindHelper.emit(EVENTS.RESETCACHE);
        };

        var getProjectMember = function (param) {
            if (_.includes(param.extFields, 'counts')) {
                return ProjectMemberResource.getWithoutCache(param);
            }

            return ProjectMemberResource.get(param);
        };

        return {
            EVENTS: EVENTS,
            resetCache: resetCache,

            fetchListByCode: function (code, extFields) {
                return getProjectMember({projectCode: code, size : API_PAGE_SIZE.ALL, extFields: extFields}).$promise;
            },

            fetchList: function (param) {
                param = param || {};
                param.page = 0;
                param.size = API_PAGE_SIZE.ALL;
                return getProjectMember(param).$promise;
            },

            fetchByMemberId: function (projectCode, memberId) {
                return  getProjectMember({projectCode: projectCode, memberId: memberId}).$promise;
            },

            //arguments = { code : "hive", organizationMemberIdList : ['1'], role : 'admin' or 'member' }
            add: function (code, organizationMemberIdList, role) {
                var param = _.map(organizationMemberIdList, function (id) {
                    return {
                        organizationMemberId: id,
                        role: role || ORG_MEMBER_ROLE.MEMBER.ROLE
                    };
                });

                return ProjectMemberResource.save({projectCode: code}, param).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            },

            //arguments = { code : "hive", memberId : '1' }
            remove: function (code, memberId) {
                return ProjectMemberResource.remove({
                    projectCode: code,
                    memberId: memberId
                }).$promise.then(function (result) {
                        resetCache();
                        return result;
                    });
            },

            //arguments = { code : 'hive', memberId : '1', role : 'admin' }
            changeRole: function (code, memberId, role) {
                return ProjectMemberResource.update({
                    projectCode: code,
                    memberId: memberId
                }, {role: role}).$promise.then(function (result) {
                        resetCache();
                        return result;
                    });
            }
        };
    }

})();
