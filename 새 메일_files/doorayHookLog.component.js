(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .component('doorayHookLog', {
            templateUrl: 'modules/setting/common/project/webhook/HookModalFactory/doorayHookLog/doorayHookLog.html',
            controller: DoorayHookLog,
            bindings: {
                hook: '<',
                closeModal: '&',
                projectCode: '@'
            }
        });

    /* @ngInject */
    function DoorayHookLog(HookLogBiz) {
        var self = this;
        this.isOk = isOk;
        this.toggleShowLogDetail = toggleShowLogDetail;
        this.fetchList = fetchList;

        this.$onChanges = function () {
            if (self.hook) {
                fetchList();
            }
        };

        function isOk(code) {
            return code >= 200 && code < 300;
        }

        function toggleShowLogDetail(log) {
            self.showLogDetailId = self.showLogDetailId === log.id ? null : log.id;
        }

        function fetchList() {
            HookLogBiz.fetchList(self.projectCode, self.hook.id).then(function (result) {
                self.logList = result.contents();
                self.showLogDetailId = null;
            });
        }
    }

})();
