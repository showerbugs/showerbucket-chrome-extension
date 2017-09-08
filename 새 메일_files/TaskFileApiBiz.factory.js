(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TaskFileApiBiz', TaskFileApiBiz);

    /* @ngInject */
    function TaskFileApiBiz(FileApiInterfaceUtil, TaskDraftFileResource, TaskFileResource, TaskEventFileResource) {

        function hasProjectTaskParams(params) {
            return !!(params && params.projectCode && params.postNumber);
        }

        return {
            draft: FileApiInterfaceUtil.createFileService(TaskDraftFileResource, {
                remove: function (fileId, params) {
                    return !!(fileId && params && params.draftId);
                },
                update: function (fileId, params) {
                    return !!(fileId && params && params.draftId);
                }
            }),
            task: FileApiInterfaceUtil.createFileService(TaskFileResource, {
                remove: function (fileId, params) {
                    return !!(fileId && params && hasProjectTaskParams(params));
                },
                update: function (fileId, params) {
                    return !!(fileId && params && hasProjectTaskParams(params));
                }
            }),
            event: FileApiInterfaceUtil.createFileService(TaskEventFileResource, {
                remove: function () {
                    throw Error('Don\'t expect access method');
                },
                update: function (fileId, params) {
                    return !!(fileId && params && hasProjectTaskParams(params) && params.eventId);
                }
            })
        };
    }

})();
