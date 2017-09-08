(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('MilestoneResource', MilestoneResource)
        .factory('AssignMilestoneResource', AssignMilestoneResource);

    /* @ngInject */
    function MilestoneResource($cacheFactory, $resource, ApiConfigUtil, API_ERROR_CODE) {
        var cache = $cacheFactory('MilestoneResource');
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/milestones/:milestoneId', {
            'projectCode': '@projectCode',
            'milestoneId': '@milestoneId'
        }, {
            'save': {method: 'POST'},
            'update': {method: 'PUT'},
            'remove': {method: 'DELETE', ignore: {resultCode: API_ERROR_CODE.SERVER_PROJECT_MILESTONE_IN_USE}},
            'get': {method: 'GET', cache: cache},
            'getWithoutCache': {method: 'GET'}
        });
    }

    /* @ngInject */
    function AssignMilestoneResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/posts/set-milestone', {
            'projectCode': '@projectCode'
        }, {
            'save': {method: 'POST'}
        });
    }

})();
