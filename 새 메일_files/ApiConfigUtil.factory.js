(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .factory('ApiConfigUtil', ApiConfigUtil);

    /* @ngInject */
    function ApiConfigUtil(API_CONFIG) {
        var wasContext = API_CONFIG.wasContext,
            orgContext = [wasContext, '/organizations/:orgCode'].join('');   //프로젝트 추가, 외부 사용자 초대와 같이 orgCode 정보가 필요한 API가 있음

        return {
            wasContext: getWasContext,
            orgContext: getOrgContext
        };

        function getWasContext() {
            return wasContext;
        }

        function getOrgContext() {
            return orgContext;
        }
    }

})();
