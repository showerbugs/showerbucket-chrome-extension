(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('TenantMemberResource', TenantMemberResource)
        .factory('TenantMemberSearchResource', TenantMemberSearchResource)
        .factory('OrgMemberResource', OrgMemberResource)
        .factory('Member', Member);

    /* @ngInject */
    function TenantMemberResource($cacheFactory, $resource, ApiConfigUtil) {
        var cache = $cacheFactory('TenantMemberResource');
        return $resource(ApiConfigUtil.wasContext() + '/members/:memberId', {
            'memberId': '@memberId'
        }, {
            'get': {method: 'GET', cache: cache},
            'getWithoutCache': {method: 'GET'},
            'update': {method: 'PUT'}
        });
    }

    /* @ngInject */
    function TenantMemberSearchResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/members/search', {
            page:'@page',
            size: '@size'
        }, {
            'search': {method: 'POST'}
        });
    }

    /* @ngInject */
    function OrgMemberResource($cacheFactory, $resource, ApiConfigUtil) {
        var cache = $cacheFactory('OrgMemberResource');
        return $resource(ApiConfigUtil.orgContext() + '/members/:memberId', {
            memberId: '@memberId',
            orgCode: '@orgCode'
        }, {
            get: {method: 'GET', cache: cache},
            getWithoutCache: {method: 'GET'},
            update: {method: 'PUT'}
        });
    }

    /* @ngInject */
    function Member($cacheFactory, API_PAGE_SIZE, OrgMemberResource, RootScopeEventBindHelper, TenantMemberResource, TenantMemberSearchResource, _) {
        var EVENTS = {
            'RESETCACHE': 'Member:resetCache'
        };

        var resetCache = function (memberId) {
            $cacheFactory.get('TenantMemberResource').removeAll();
            $cacheFactory.get('OrgMemberResource').removeAll();
            RootScopeEventBindHelper.emit(EVENTS.RESETCACHE, memberId);
        };

        var getMember = function (param) {
            if (_.includes(param.extFields, 'counts')) {
                return TenantMemberResource.getWithoutCache(param);
            }
            return TenantMemberResource.get(param);
        };

        var getMemberWithoutCache = function (param) {
            return TenantMemberResource.getWithoutCache(param);
        };

        return {
            EVENTS: EVENTS,
            resetCache: resetCache,

            fetchList: fetchList,
            fetchListWithoutCache: fetchListWithoutCache,
            fetchListWithoutPaging: fetchListWithoutPaging,
            fetchListByRole: fetchListByRole,
            fetchOrgMembers: fetchOrgMembers,
            fetchMyInfo: fetchMyInfo,
            fetchMyInfoWithCounts: fetchMyInfoWithCounts,
            fetchMyInfoWithoutCache: fetchMyInfoWithoutCache,
            getByMemberId: getByMemberId,
            changeWithUserCode: changeWithUserCode,
            deleteOrgMemberByMemberId: deleteOrgMemberByMemberId,
            changeOrgRole: changeOrgRole,
            update: update,
            search: search,
            searchWithParam: searchWithParam
        };

        function fetchList(param) {
            return getMember(param).$promise;
        }

        function fetchListWithoutCache(param) {
            return getMemberWithoutCache(param).$promise;
        }

        function fetchListWithoutPaging() {
            var param = {size: API_PAGE_SIZE.ALL};
            return getMember(param).$promise;
        }

        function fetchListByRole(param) {
            return getMemberWithoutCache(param).$promise;
        }

        function fetchMyInfo() {
            return getByMemberId('me');
        }

        function fetchMyInfoWithCounts() {
            return getMember({memberId: 'me', extFields: 'counts'}).$promise;
        }

        function fetchMyInfoWithoutCache() {
            return getMemberWithoutCache({memberId: 'me'}).$promise;
        }

        function getByMemberId(memberId) {
            return getMember({memberId: memberId}).$promise;
        }

        function fetchOrgMembers(params) {
            return OrgMemberResource.get(params).$promise.then(function (result) {
                return result;
            });
        }

        // params: {memberId, name, userCode, orgCode}
        function changeWithUserCode(params) {
            return TenantMemberResource.update(params).$promise.then(function (result) {
                resetCache(params.memberId);
                return result;
            });
        }

        function deleteOrgMemberByMemberId(memberId, orgCode) {
            return OrgMemberResource.delete({memberId: memberId, orgCode: orgCode}).$promise.then(function (result) {
                resetCache(memberId);
                return result;
            });
        }

        function changeOrgRole(memberId, orgCode, role) {
            return OrgMemberResource.update({memberId: memberId, orgCode: orgCode, organizationMemberRole: role}).$promise.then(function (result) {
                resetCache(memberId);
                return result;
            });
        }

        function update(memberId, params) {
            return TenantMemberResource.update({memberId: memberId}, params).$promise.then(function (result) {
                resetCache(memberId);
                return result;
            });
        }

        function search(param) {
            return TenantMemberSearchResource.search(param).$promise;
        }

        function searchWithParam(query, searchField, searchType, boost) {
            searchField = searchField || 'all';
            var param = {
                page: 0,
                size: API_PAGE_SIZE.search,
                typeList: searchType
            };
            param[searchField] = query;

            if(boost) {
                param.boost = boost;
                if(boost.ids) {
                    param.size = boost.ids.length;
                }
            }

            return TenantMemberSearchResource.search(param).$promise;
        }
    }

})();
