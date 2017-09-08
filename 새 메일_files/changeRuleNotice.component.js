(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .component('changeRuleNotice', {
            templateUrl: 'modules/components/changeRuleNotice/changeRuleNotice.html',
            controller: ChangeRuleNotice,
            bindings: {
                close: '&'
            }
        });

    /* @ngInject */
    function ChangeRuleNotice($cookies, moment) {
        var $ctrl = this;

        $ctrl.setNeverOpenedCookie = setNeverOpenedCookie;

        function setNeverOpenedCookie() {
            var expireDay = moment().add(20, 'days').toDate(),
                cookieKey = 'dooray_notice';

            $cookies.put(cookieKey, 'true' + '', {
                'expires': expireDay,
                'domain': '.dooray.com',
                'path': '/'
            });
            $ctrl.close();
        }

    }

})();
