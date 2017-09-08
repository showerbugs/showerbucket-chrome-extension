(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('ServiceResource', ServiceResource)
        .factory('IpAclResource', IpAclResource)
        .factory('MemberAclResource', MemberAclResource)
        .factory('ServiceBiz', ServiceBiz)
        .factory('IpAclBiz', IpAclBiz)
        .factory('MemberAclBiz', MemberAclBiz);

    /* @ngInject */
    function ServiceResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/organizations/:orgCode/services/:serviceName', {
            orgCode: '@orgCode',
            serviceName: '@serviceName'
        }, {
            get: { method: 'GET' },
            update: {method: 'PUT'}
        });
    }

    /* @ngInject */
    function IpAclResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/organizations/:orgCode/services/:serviceName/ip-acl', {
            orgCode: '@orgCode',
            serviceName: '@serviceName'
        }, {
            get: { method: 'GET' },
            update: {method: 'PUT'}
        });
    }

    /* @ngInject */
    function MemberAclResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/organizations/:orgCode/services/:serviceName/member-acl', {
            orgCode: '@orgCode',
            serviceName: '@serviceName'
        }, {
            get: { method: 'GET' },
            update: {method: 'PUT'}
        });
    }

    /* @ngInject */
    function ServiceBiz(API_PAGE_SIZE, ServiceResource) {
        return {
            fetchList: function (orgCode) {
                return ServiceResource.get({orgCode: orgCode, page: API_PAGE_SIZE.ALL}).$promise;
            },
            fetch: function (orgCode, serviceName) {
                return ServiceResource.get({orgCode: orgCode, serviceName: serviceName}).$promise;
            },
            update: function (orgCode, serviceName, requestBody) {
                return ServiceResource.update({orgCode: orgCode, serviceName: serviceName}, requestBody).$promise;
            }
        };
    }

    /* @ngInject */
    function IpAclBiz(API_PAGE_SIZE, IpAclResource) {
        return {
            fetchList: function (orgCode, serviceName) {
                return IpAclResource.get({orgcode: orgCode, serviceName: serviceName, page: API_PAGE_SIZE.ALL}).$promise;
            },
            update: function (orgCode, serviceName, requestBody) {
                return IpAclResource.update({orgCode: orgCode, serviceName: serviceName}, requestBody).$promise;
            }
        };
    }

    /* @ngInject */
    function MemberAclBiz(API_PAGE_SIZE, MemberAclResource) {
        return {
            fetchList: function (orgCode, serviceName) {
                return MemberAclResource.get({orgcode: orgCode, serviceName: serviceName, page: API_PAGE_SIZE.ALL}).$promise;
            },
            update: function (orgCode, serviceName, requestBody) {
                return MemberAclResource.update({orgCode: orgCode, serviceName: serviceName}, requestBody).$promise;
            }
        };
    }

})();
