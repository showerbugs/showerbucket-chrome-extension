(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailDraftResource', MailDraftResource);

    /* @ngInject */
    function MailDraftResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/mail-drafts/:draftId', {
            'draftId': '@draftId'
        }, {
            'get': {
                url: ApiConfigUtil.wasContext() + '/mails/:draftId',    //mail과 draft 데이터는 동일한 경로로 요청됨
                method: 'GET'
            },
            'save': {method: 'POST', ignore: {responseError: true}},
            'update': {method: 'PUT'},
            'remove': {method: 'DELETE'},
            'removeArray': { //영구삭제
                url: ApiConfigUtil.wasContext() + '/mails/delete',
                method: 'POST'
            }
        });
    }

})();
