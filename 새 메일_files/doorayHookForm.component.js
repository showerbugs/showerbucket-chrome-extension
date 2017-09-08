(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .component('doorayHookForm', {
            templateUrl: 'modules/setting/common/project/webhook/HookModalFactory/doorayHookForm/doorayHookForm.html',
            controller: DoorayHookForm,
            bindings: {
                form: '<',
                closeModal: '&',
                submit: '&',
                titlePostfix: '@',
                submitBtnLabel: '@'
            }
        });

    /* @ngInject */
    function DoorayHookForm(HookBiz, MessageModalFactory, gettextCatalog, _) {
        var self = this;
        this.submitForm = submitForm;

        this.$onChanges = onChanges;

        function submitForm() {
            if (!self.form.url) {
                MessageModalFactory.alert(gettextCatalog.getString('URL을 입력해 주세요.'));
                return;
            }

            self.form.sendEvents = _makeSendEventsToForm();
            if (_.isEmpty(self.form.sendEvents)) {
                MessageModalFactory.alert(gettextCatalog.getString('알림 이벤트를 적어도 1개 이상 선택해 주세요.'));
                return;
            }

            self.submit({form: self.form});
        }

        function onChanges() {
            var initialForm = {
                url: '',
                sendEvents: [],
                active: true
            };
            self.form = self.form || initialForm;
            self.sendEvents = {
                postRegistered: _.includes(self.form.sendEvents, HookBiz.HOOK_EVENTS.POST_REGISTERED),
                commentRegistered: _.includes(self.form.sendEvents, HookBiz.HOOK_EVENTS.COMMENT_REGISTERED)
            };
        }

        function _makeSendEventsToForm() {
            var sendEvents = [];
            if (self.sendEvents.postRegistered) {
                sendEvents.push(HookBiz.HOOK_EVENTS.POST_REGISTERED);
            }

            if (self.sendEvents.commentRegistered) {
                sendEvents.push(HookBiz.HOOK_EVENTS.COMMENT_REGISTERED);
            }
            return sendEvents;
        }
    }

})();
