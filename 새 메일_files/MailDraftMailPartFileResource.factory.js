(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailDraftMailPartFileResource', MailDraftMailPartFileResource);

    /* @ngInject */
    function MailDraftMailPartFileResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/mail-drafts/:draftId/files/attach-from-mail', {
            'draftId': '@draftId'
        }, {
            'save': {method: 'POST', timeout: 30000} //메일의 멀티파트 파일을 저장 후 응답 시간 30s
        });
    }

})();
