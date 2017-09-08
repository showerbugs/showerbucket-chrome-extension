(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .component('webhookSetting', {
            templateUrl: 'modules/setting/common/project/webhook/webhookSetting/webhookSetting.html',
            controller: WebhookSetting,
            bindings: {
                projectCode: '@',
                projectState: '@'
            }
        });

    /* @ngInject */
    function WebhookSetting(HookBiz, HookModalFactory, _) {
        var self = this;

        this.TABS = {
            USED: 'used',
            UNUSED: 'unused'
        };
        this.count = {
            used: 0,
            unused: 0
        };

        this.changeTab = changeTab;
        this.fetchList = fetchList;
        this.openHookCreateModal = openHookCreateModal;

        _init();

        function changeTab(tabName) {
            self.tab = tabName;
            fetchList();
        }

        function fetchList() {
            HookBiz.fetchList(self.projectCode).then(function (result) {
                var allHooks = result.contents();
                self.hookList = _.filter(allHooks, {active: self.tab === self.TABS.USED});
                var count = _.countBy(allHooks, 'active');
                self.count.used = count.true || 0;
                self.count.unused = count.false || 0;
            });
        }

        function openHookCreateModal() {
            HookModalFactory.openCreate(self.projectCode).result.then(fetchList);
        }

        function _init() {
            self.tab = self.TABS.USED;
            fetchList();
        }
    }

})();
