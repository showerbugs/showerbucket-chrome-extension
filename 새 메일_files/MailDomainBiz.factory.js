(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('MailDomainResource', MailDomainResource)
        .factory('MailDomainBiz', MailDomainBiz);

    /* @ngInject */
    function MailDomainResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/mail-domains/:mailDomain', {
            'mailDomain': '@mailDomain'
        }, {
            'get': { method: 'GET'},
            'save': {method: 'POST'},
            'update': {method: 'PUT'},
            'checkExist': {method: 'POST', url: ApiConfigUtil.wasContext() + '/mail-domains/:mailDomain/check'}
        });
    }

    /* @ngInject */
    function MailDomainBiz(MailDomainResource) {
        return {
            checkDomainExist: function (mailDomain) {
                return MailDomainResource.checkExist({mailDomain: mailDomain}).$promise;
            },
            fetchList: function (param) {
                return MailDomainResource.get(param).$promise;
            }
        };
    }

})();
