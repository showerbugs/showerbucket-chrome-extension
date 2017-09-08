(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailDraftFileResource', MailDraftFileResource);

    /* @ngInject */
    function MailDraftFileResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/mail-drafts/:draftId/files', {
            'draftId': '@draftId'
        }, {
            'get': {method: 'GET', cancellable: true},
            'remove': {
                url: ApiConfigUtil.wasContext() + '/mail-drafts/:draftId/parts/:partNumber',
                method: 'DELETE'
            },
            'removeBigFile': {
                url: ApiConfigUtil.wasContext() + '/mail-drafts/:draftId/files/:fileId',
                method: 'DELETE'
            }
        });
    }

})();
