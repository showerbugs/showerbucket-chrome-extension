(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .component('mailAutoReply', {
            templateUrl: 'modules/setting/user/mailAutoReply/mailAutoReply.html',
            controller: MailAutoReply,
            bindings: {
                item: '<'
            }
        });

    /* @ngInject */
    function MailAutoReply($scope, HelperFormUtil, MessageModalFactory, SettingResource, moment, gettextCatalog) {
        var $ctrl = this,
            DATE_FORMAT = 'YYYY.MM.DD',
            CATEGORY = 'mail.auto-reply';

        $ctrl.onChangeEnabled = onChangeEnabled;
        $ctrl.convertToDayFormat = convertToDayFormat;
        $ctrl.submit = submit;
        $ctrl.cancel = cancel;

        _init();

        function onChangeEnabled(enabled) {
            if (enabled) {
                var today = moment().startOf('day');
                $ctrl.form.startedAt = $ctrl.form.startedAt || today.format();
                $ctrl.form.endedAt = $ctrl.form.endedAt || today.add(1, 'day').format();
            }
        }

        function convertToDayFormat(date) {
            return moment(date).format(DATE_FORMAT);
        }

        function submit() {
            if (HelperFormUtil.checkInvaild($scope[$ctrl.FORM_NAME])) {
                return;
            }

            if ($ctrl.form.enabled && moment($ctrl.form.startedAt).isAfter($ctrl.form.endedAt)) {
                MessageModalFactory.alert(gettextCatalog.getString('시작일은 종료일 이전으로 입력해 주세요.'));
                return;
            }

            if (!$ctrl.form.enabled) {
                $ctrl.form.startedAt = null;
                $ctrl.form.endedAt = null;
                $ctrl.form.message = '';
            }
            SettingResource.update({memberId: 'me', category: CATEGORY}, $ctrl.form).$promise.then(function () {
                $ctrl.resultMsg = gettextCatalog.getString("저장되었습니다.");
            });
        }

        function cancel() {
            _reset();
            $ctrl.resultMsg = gettextCatalog.getString('취소되었습니다.');
        }

        function _init() {
            var today = moment().startOf('day');
            $ctrl.FORM_NAME = 'autoReply';
            $ctrl.MESSAGE_MAX_LENGTH = 5000;
            HelperFormUtil.bindService($scope, $ctrl.FORM_NAME);

            $ctrl.ui = {
                timezone: today.format('Z')
            };
            _reset();
        }

        function _reset() {
            SettingResource.get({memberId: 'me', category: CATEGORY}).$promise.then(function (result) {
                $ctrl.form = result.contents().value;
            });

        }



    }

})();
