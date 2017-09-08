(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailRuleResource', MailRuleResource);

    /* @ngInject */
    function MailRuleResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/mail-rules/:ruleId', {
            'ruleId': '@ruleId'
        }, {
            'get': {method: 'GET'},
            'save': {method: 'POST'},
            'update': {method: 'PUT'},
            'remove': {method: 'DELETE'},
            'changeOrder': {
                url: ApiConfigUtil.wasContext() + '/mail-rules/:ruleId/set-apply-order',
                method: 'POST'
            }
        });
    }

})();
