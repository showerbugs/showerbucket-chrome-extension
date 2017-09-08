(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailFolderResource', MailFolderResource);

    /* @ngInject */
    function MailFolderResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/mail-folders/:folderId', {
            'folderId': '@folderId'
        }, {
            'get': {method: 'GET', cancellable: true},
            'save': {method: 'POST'},
            'update': {method: 'PUT'},
            'remove': {method: 'DELETE', ignore: {resultCode: -300401}}
        });
    }

})();
