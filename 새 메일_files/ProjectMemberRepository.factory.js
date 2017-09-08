(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('ProjectMemberInvitationRepository', ProjectMemberInvitationRepository);

    /* @ngInject */
    function ProjectMemberInvitationRepository(HelperPromiseUtil, ProjectMemberResource, _) {
        var paramCache = {},
            listContents = [],
            orgMemberIdListContents = [],
            promise = null;

        return {
            fetchAndCache: fetchAndCache,
            getList: getList,
            getOrgMemberIdList: getOrgMemberIdList,
            getCurrentParam: getCurrentParam
        };

        function fetchAndCache(param) {
            HelperPromiseUtil.cancelResource(promise);
            promise = ProjectMemberResource.get(param);
            return promise.$promise.then(function (res) {
                paramCache = param;
                listContents = res.contents();
                orgMemberIdListContents = _.map(listContents, 'organizationMemberId');
                return listContents;
            });
        }

        function getList() {
            return listContents;
        }

        function getOrgMemberIdList() {
            return orgMemberIdListContents;
        }

        function getCurrentParam() {
            return paramCache;
        }
    }

})();
