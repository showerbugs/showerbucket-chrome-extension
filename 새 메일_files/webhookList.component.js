(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .component('webhookList', {
            require: {
                hookSetting: '^webhookSetting'
            },
            templateUrl: 'modules/setting/common/project/webhook/webhookList/webhookList.html',
            controller: WebhookList,
            bindings: {
                list: '<'
            }
        });

    /* @ngInject */
    function WebhookList(HookBiz, HookModalFactory, gettextCatalog, _) {
        var self = this,
            SEND_EVENT_LABELS = {
                post_registered: gettextCatalog.getString('업무 등록'),
                comment_registered: gettextCatalog.getString('댓글 등록')
            };

        this.translateHumanReadable = translateHumanReadable;
        this.openUpdateModal = openUpdateModal;
        this.removeHook = removeHook;
        this.openLogModal = openLogModal;

        function translateHumanReadable(sendEvents) {
            return '(' + _(sendEvents).map(function (sendEvent) {
                return SEND_EVENT_LABELS[sendEvent];
            }).join(', ') + ')';
        }

        function openUpdateModal(hook) {
            HookModalFactory.openUpdate(self.hookSetting.projectCode, hook).result.then(self.hookSetting.fetchList);
        }

        function removeHook(hookId) {
            HookBiz.remove(self.hookSetting.projectCode, hookId).then(self.hookSetting.fetchList);
        }

        function openLogModal(hook) {
            HookModalFactory.openLogList(self.hookSetting.projectCode, hook);
        }
    }

})();
