(function () {

    'use strict';

    angular
        .module('doorayWebApp')
        .component('mailContentsScheduleStatusInView', {
            templateUrl: 'modules/mail/view/mailContentsScheduleStatusInView/mailContentsScheduleStatusInView.html',
            controller: MailContentsScheduleStatusInView,
            bindings: {
                mailId: '<'
            }
        });

    /* @ngInject */
    function MailContentsScheduleStatusInView(MailItemsAction, HelperConfigUtil, DateConvertUtil, HelperPromiseUtil, CalendarScheduleAction, _) {
        var $ctrl = this,
            useService = HelperConfigUtil.serviceUse(),
            enableNewFeature = HelperConfigUtil.enableNewFeature(),
            setStatusPromise = null;

        //PreDefined Callback;

        this.$onInit = function () {
            $ctrl.calendar = {
                show: enableNewFeature || _.isBoolean(useService.calendar),
                goState: 'main.page.calendar',
                disabled: !enableNewFeature && !useService.calendar
            };

            _fetch();
        };

        function _fetch() {
            MailItemsAction.fetchScheduleStatus($ctrl.mailId).then(function (result) {
                $ctrl.method = result.contents().method;
                $ctrl.status = result.contents().status;
                $ctrl.schedule = result.contents().simpleSchedule;
            });
        }

        $ctrl.changeStatus = function (status) {
            if (HelperPromiseUtil.isResourcePending(setStatusPromise) || status === $ctrl.status) {
                return;
            }
            $ctrl.status = status;
            setStatusPromise = CalendarScheduleAction.setStatus($ctrl.schedule.id, status).then(_fetch);
        };

        $ctrl.convertDateTimeRangeUTCFormat = DateConvertUtil.convertDateTimeRangeUTCFormat.bind(DateConvertUtil);
    }

})();
