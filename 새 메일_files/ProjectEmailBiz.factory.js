(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('ProjectEmailResource', ProjectEmailResource)
        .factory('ProjectEmailBiz', ProjectEmailBiz);

    /* @ngInject */
    function ProjectEmailResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/emails/:emailId', {
            projectCode: '@projectCode',
            emailId: '@emailId'
        }, {
            save: {method: 'POST'},
            update: {method: 'PUT'},
            remove: {method: 'DELETE'}
        });
    }

    /* @ngInject */
    function ProjectEmailBiz(ProjectEmailResource) {
        return {
            save: function (projectCode, emailId, requestBody) {
                return ProjectEmailResource.save(_makeParam(projectCode, emailId), [requestBody]).$promise;
            },
            update: function (projectCode, emailId, requestBody) {
                return ProjectEmailResource.update(_makeParam(projectCode, emailId), requestBody).$promise;
            },
            remove: function (projectCode, emailId) {
                return ProjectEmailResource.remove(_makeParam(projectCode, emailId)).$promise;
            }
        };

        function _makeParam(projectCode, emailId) {
            return {
                projectCode: projectCode,
                emailId: emailId
            };
        }
    }

})();
