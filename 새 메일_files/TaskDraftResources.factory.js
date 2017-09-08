(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TaskDraftResource', TaskDraftResource)
        .factory('TaskDraftFileResource', TaskDraftFileResource)
        .factory('TaskDraftMailPartFileResource', TaskDraftMailPartFileResource);

    /* @ngInject */
    function TaskDraftResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/drafts/:draftId', {
            'draftId': '@draftId'
        }, {
            'get': {method: 'GET', cancellable: true},
            'save': {method: 'POST', ignore: {responseError: true}},
            'update': {method: 'PUT'},
            'remove': {method: 'DELETE'},
            'removeArray': {url: ApiConfigUtil.wasContext() + '/drafts/delete', method: 'POST'}
        });
    }

    /* @ngInject */
    function TaskDraftFileResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/drafts/:draftId/files/:fileId', {
            'draftId': '@draftId',
            'fileId': '@fileId'
        }, {
            'save': {method: 'POST'},
            'remove': {method: 'DELETE'}
        });
    }

    /* @ngInject */
    function TaskDraftMailPartFileResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/drafts/:draftId/files/attach-from-mail', {
            'draftId': '@draftId'
        }, {
            'save': {method: 'POST', timeout: 30000} //메일의 멀티파트 파일을 저장 후 응답 시간 30s
        });
    }

})();
