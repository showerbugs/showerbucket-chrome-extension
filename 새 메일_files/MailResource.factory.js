(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailResource', MailResource);

    /* @ngInject */
    function MailResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/mails/:mailId', {
            'mailId': '@mailId'
        }, {
            'save': {
                url: ApiConfigUtil.wasContext() + '/mails/send',
                method: 'POST',
                timeout: 60000  //메일의 전송 후 최대 응답 시간 1m
            },
            'get': {method: 'GET', cancellable: true},
            'remove': {method: 'DELETE'},
            'removeArray': { //영구삭제
                url: ApiConfigUtil.wasContext() + '/mails/delete',
                method: 'POST'
            },
            'move': {
                url: ApiConfigUtil.wasContext() + '/mails/move',
                method: 'POST'
            },
            'raw': {
                method: 'GET',
                url: ApiConfigUtil.wasContext() + '/mails/:mailId?type=raw',
                raw: true
            },
            'fetchSchedule': {
                method: 'POST',
                url: ApiConfigUtil.wasContext() + '/mails/:mailId/fetch-schedule'
            }
        });
    }

})();
