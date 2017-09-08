(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .factory('MailRuleBiz', MailRuleBiz);

    /* @ngInject */
    function MailRuleBiz(MailRuleResource, MailSearchResource) {
        var MAX_PREVIEW_MAIL_SIZE = 50;
        return {
            fetchList: function () {
                return MailRuleResource.get().$promise;
            },
            save: function (param) {
                return MailRuleResource.save(param).$promise;
            },
            update: function (ruleId, param) {
                return MailRuleResource.update({
                    ruleId: ruleId
                }, param).$promise;
            },
            remove: function (ruleId) {
                return MailRuleResource.remove({
                    ruleId: ruleId
                }).$promise;
            },
            changeOrder: function (ruleId, order) {
                return MailRuleResource.changeOrder({
                    ruleId: ruleId,
                    toApplyOrder: order
                }).$promise;
            },
            previewApplyBeforeMail: function (param) {
                param.page = 0;
                param.size = MAX_PREVIEW_MAIL_SIZE;
                return MailSearchResource.search(param).$promise;
            }
        };
    }

})();
