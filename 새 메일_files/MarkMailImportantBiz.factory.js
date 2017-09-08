(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailAnnotationResource', MailAnnotationResource)
        .factory('MarkMailImportantBiz', MarkMailImportantBiz);

    /* @ngInject */
    function MailAnnotationResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/mails/:mailId/annotations', {
            'mailId': '@mailId'
        }, {
            'save': {method: 'PUT'}
        });
    }

    /* @ngInject */
    function MarkMailImportantBiz(MailAnnotationResource) {
        return {
            toggleFavorite : function(mail){
                var _query = {
                    'mailId': mail.id,
                    'favorited': !mail.annotations.favorited
                };
                return MailAnnotationResource.save(_query).$promise;
            }
        };
    }

})();
