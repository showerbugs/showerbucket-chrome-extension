(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarDetailUrlApiBiz', CalendarDetailUrlApiBiz);

    /* @ngInject */
    function CalendarDetailUrlApiBiz($resource, ApiConfigUtil, ResponseWrapAppendHelper, $q) {

        return {
            fetchDataByUrlParam: fetchDataByUrlParam,
            fetchList: fetchList,
            fetchDataByUrlParamMock: fetchDataByUrlParamMock
        };

        function makeResource(detailUrl) {
            return $resource(ApiConfigUtil.wasContext() + detailUrl, {}, {
                'get': {method: 'GET'},
                'query': {method: 'GET', isArray: true}
            });
        }

        function fetchDataByUrlParam(detailUrl, param) {
            return makeResource(detailUrl).get(param).$promise;
        }

        function fetchDataByUrlParamMock(/*detailUrl, param*/) {
            return $q.when(ResponseWrapAppendHelper.create(mock));
        }

        function fetchList(detailUrl, param) {
            return makeResource(detailUrl).query(param).$promise;
        }

    }

})();
