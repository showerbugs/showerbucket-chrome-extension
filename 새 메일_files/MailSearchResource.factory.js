(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailSearchResource', MailSearchResource);

    /* @ngInject */
    function MailSearchResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/mails/search', {}, {
            'search': {method: 'POST'}
        });
    }

})();
