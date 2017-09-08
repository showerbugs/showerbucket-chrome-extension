(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailReadResource', MailReadResource)
        .factory('MarkMailReadBiz', MarkMailReadBiz);

    /* @ngInject */
    function MailReadResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/mails/read', {}, {
            'read': {method: 'post'},
            'unread': {
                url: ApiConfigUtil.wasContext() + '/mails/unread',
                method: 'POST'
            }
        });
    }

    //TODO REMOVE 레거시...
    /* @ngInject */
    function MarkMailReadBiz(MailReadResource) {
        return {
            setRead: function (params) {
                return MailReadResource.read(params);
            },
            setUnread: function (params) {
                return MailReadResource.unread(params);
            }
        };
    }

})();
