(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('OrganizationResource', OrganizationResource)
        .factory('OrganizationBiz', OrganizationBiz);

    /* @ngInject */
    function OrganizationResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/organizations/:orgCode', {
            'orgCode': '@orgCode'
        }, {
            'get': {method: 'GET'},
            'save': {method: 'POST'},
            'update': {method: 'PUT'}
        });
    }

    /* @ngInject */
    function OrganizationBiz($q, API_PAGE_SIZE, OrganizationResource, RootScopeEventBindHelper, _) {
        // 이 변수 자체는 한번 정한 후 reference가 변경되지 않도록 하기 위해 object를 사용한다
        var datas = [];

        var EVENTS = {
            RESETCACHE: 'Organization:resetCache'
        };

        var resetCache = function () {
            RootScopeEventBindHelper.emit(EVENTS.RESETCACHE);
        };

        return {
            EVENTS: EVENTS,
            resetCache: resetCache,
            get: function () {
                if (_.isEmpty(datas)) {
                    return this.fromServer().then(function () {
                        return $q.when(datas);
                    });
                }
                return $q.when(datas);
            },

            fromServer: function (params) {
                params = params || {};
                params.size = API_PAGE_SIZE.ALL;
                return OrganizationResource.get(params).$promise.then(function (result) {
                    datas = result.contents();
                    return result;
                });
            },

            getByCode: function (orgCode) {
                return OrganizationResource.get({
                    orgCode: orgCode
                }).$promise;
            },

            // params: {name, description, domainName}
            createOrganization: function (params) {
                return OrganizationResource.save([params]).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            },

            // params; {name, description, domainName}
            modifyOrganization: function (orgCode, params) {
                return OrganizationResource.update({
                    orgCode: orgCode
                }, params).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            }
        };
    }

})();
