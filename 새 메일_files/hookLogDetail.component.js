(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .component('hookLogDetail', {
            require: {
                hookLog: '^doorayHookLog'
            },
            templateUrl: 'modules/setting/common/project/webhook/HookModalFactory/hookLogDetail/hookLogDetail.html',
            controller: HookLogDetail,
            bindings: {
                log: '<'
            }
        });

    /* @ngInject */
    function HookLogDetail($element, HookLogBiz, DoorayLazyLoad) {
        var self = this;
        var bodyContent$ = $element.find('.detail-body .body-content');
        this.TABS = {
            REQUEST: 'request',
            RESPONSE: 'response'
        };

        this.changeTab = changeTab;
        this.resend = resend;
        this.$onChanges = function () {
            _init();
        };

        function changeTab(tab) {
            self.tab = tab;
            _reset();
        }

        function resend() {
            HookLogBiz.resend(self.hookLog.projectCode, self.log.hookId, self.log.id).then(function () {
                self.hookLog.fetchList();
            });
        }

        function _init() {
            self.tab = self.TABS.REQUEST;
            _fetch();
        }

        function _fetch() {
            HookLogBiz.fetch(self.hookLog.projectCode, self.log.hookId, self.log.id).then(function (result) {
                self.fetchedLog = result.contents();
                _reset();
            });
        }

        function _reset() {
            self.current = self.fetchedLog[self.tab];

            var headerStrings = self.current.header.split('\n');
            if (_.isEmpty(headerStrings)) {
                self.isJson = false;
                return;
            }
            self.isJson = !!_.find(headerStrings, function (headerString) {
                var strings = headerString.split(':');
                if (_.isEmpty(strings)) {
                    return;
                }
                return _.startsWith(strings[0].toLowerCase(), 'content-type') && _.includes(strings[1].toLowerCase(), 'application/json');
            });
            if (self.isJson) {
                DoorayLazyLoad.loadPrettyJSON().then(function (PrettyJSON) {
                    _setPrettyJsonContent(PrettyJSON, self.current.body);
                });
            }
        }

        function _setPrettyJsonContent(PrettyJSON, expr) {
            var obj;
            try {
                obj = JSON.parse(expr);
            } catch (err) {
                return 'invalid json : ' + err + expr;
            }
            new PrettyJSON.view.Node({
                el: bodyContent$,
                data: obj
            });
        }
    }

})();
