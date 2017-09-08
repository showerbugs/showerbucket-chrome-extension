(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('MyInfo', MyInfo);

    /* @ngInject */
    function MyInfo($q, $rootScope, ORG_MEMBER_ROLE, HelperConfigUtil, HelperPromiseUtil, Member, RootScopeEventBindHelper, _) {
        var data = {
                myInfo: {},
                myOrgList: [],
                myAdminOrgList: [],
                myDefaultOrg: {}
            },
            promise = null,
            resultMethod = {
                myInfo: function (result) {
                    return result.contents();
                },
                myOrgList: function (result) {
                    var defaultOrgId = null;
                    return _(result.contents().organizationMemberRoleMap)
                        .values()
                        .map(function (organization) {
                            if (organization.defaultFlag) {
                                defaultOrgId = organization.organizationId;
                            }
                            return result.refMap.organizationMap(organization.organizationId);
                        })
                        .sortBy(function (organization) {
                            return defaultOrgId === organization.id ? '' : organization.name.toLowerCase();
                        }).value();
                },
                myAdminOrgList: function (result) {
                    var defaultOrgId = null;
                    return _(result.contents().organizationMemberRoleMap)
                        .values()
                        .filter(function (organization) {
                            if (organization.defaultFlag) {
                                defaultOrgId = organization.organizationId;
                            }
                            return organization.role === ORG_MEMBER_ROLE.OWNER.ROLE || organization.role === ORG_MEMBER_ROLE.ADMIN.ROLE;
                        })
                        .map(function (organization) {
                            return result.refMap.organizationMap(organization.organizationId);
                        })
                        .sortBy(function (organization) {
                            return defaultOrgId === organization.id ? '' : organization.name.toLowerCase();
                        }).value();
                },
                myDefaultOrg: function (result) {
                    return result.refMap.organizationMap(_.find(result.contents().organizationMemberRoleMap, {'defaultFlag': true}).organizationId);
                }
            },
            KEYS = {
                MY_INFO: 'myInfo',
                MY_ORG_LIST: 'myOrgList',
                MY_ADMIN_ORG_LIST: 'myAdminOrgList',
                MY_DEFAULT_ORG: 'myDefaultOrg'
            },
            EVENTS = {
                RESETCACHE: 'MyInfo:resetCache'
            };

        RootScopeEventBindHelper.withScope($rootScope)
            .on(Member.EVENTS.RESETCACHE, function (memberId) {
                if (memberId === 'me' || memberId === HelperConfigUtil.orgMemberId()) {
                    resetCache();
                }
            });

        return {
            EVENTS: EVENTS,
            KEYS: KEYS,
            resetCache: resetCache,
            getDatas: getDatas,
            getMyInfo: getMyInfo,
            getMyOrgList: getMyOrgList,
            getMyAdminOrgList: getMyAdminOrgList,
            getMyDefaultOrg: getMyDefaultOrg,
            updateMyInfo: updateMyInfo
        };

        function resetCache() {
            promise = Member.fetchMyInfoWithoutCache().then(setTargetData);
            RootScopeEventBindHelper.emit(EVENTS.RESETCACHE);
            return promise;
        }

        function getDatas() {
            return $q.all(_.map(arguments, function (methodName) {
                return _getTargetData(methodName);
            }));
        }

        function getMyInfo() {
            return _getTargetData(KEYS.MY_INFO);
        }

        function getMyOrgList() {
            return _getTargetData(KEYS.MY_ORG_LIST);
        }

        function getMyAdminOrgList() {
            return _getTargetData(KEYS.MY_ADMIN_ORG_LIST);
        }

        function getMyDefaultOrg() {
            return _getTargetData(KEYS.MY_DEFAULT_ORG);
        }

        function updateMyInfo(params) {
            return Member.update('me', params);
        }

        function _getTargetData(target) {
            if (!promise) {
                return _fetchMyInfo().then(function () {
                    return $q.when(data[target]);
                });
            }
            if (!HelperPromiseUtil.isResourcePending(promise)) {
                return $q.when(data[target]);
            }
            return promise.then(function () {
                return $q.when(data[target]);
            });
        }

        function setTargetData(result) {
            _.forEach(resultMethod, function (method, key) {
                data[key] = method(result);
            });
            return result;
        }

        function _fetchMyInfo() {
            promise = Member.fetchMyInfo().then(setTargetData);
            return promise;
        }
    }

})();
