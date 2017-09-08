(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailDisplayUser', {
            /* @ngInject */
            templateUrl: function ($attrs) {
                return 'modules/mail/view/bodyItems/mailDisplayUser/mailDisplayUser' +
                    ($attrs.withProfileImage ? '.withImage' : '') + '.html';
            },
            controller: MailDisplayUser,
            bindings: {
                user: '<',  //mail.users 내의 from, to, cc는 모두 emailUser 고정이며 실제 classify 요청을 통해 실제 email type을 얻어옴
                classifyMap: '<'
            }
        });

    /* @ngInject */
    function MailDisplayUser(MailDistributionListBiz) {
        var $ctrl = this;

        $ctrl.isOpenDlPopover = false;
        $ctrl.fetchDetailDLInfo = fetchDetailDLInfo;

        this.$onChanges = function () {
            if ($ctrl.user && $ctrl.classifyMap) {
                $ctrl.classifyUser = $ctrl.classifyMap[$ctrl.user[$ctrl.user.type].emailAddress];
            }
        };

        function fetchDetailDLInfo(dl) {
            $ctrl.selectedDistributionList = [];
            return MailDistributionListBiz.fetch(dl.id).then(function (result) {
                $ctrl.selectedDistributionList = result.contents().distributionItemList;
                $ctrl.isOpenDlPopover = $ctrl.selectedDistributionList.length > 0;
            });
        }
    }

})();
