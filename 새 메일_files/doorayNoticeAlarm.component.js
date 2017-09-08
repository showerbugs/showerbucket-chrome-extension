(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .component('doorayNoticeAlarm', {
            templateUrl: 'modules/components/doorayNoticeAlarm/doorayNoticeAlarm.html',
            controller: DoorayNoticeAlarm,
            bindings: {
                msg: '<',
                fadeoutDelay: '@'
            }
        });

    /* @ngInject */
    function DoorayNoticeAlarm($element, $timeout) {
        var $ctrl = this,
            timer = null;
        var delay = $ctrl.fadeoutDelay > 5 ? $ctrl.fadeoutDelay - 5 : 0;

        this.$onChanges = function () {
            if (!$ctrl.msg) {
                $element.css('display', 'none');
                return;
            }

            $element.removeClass('fade-out');
            $element.css('display', '');
            $timeout.cancel(timer);
            if ($ctrl.fadeoutDelay) {
                $timeout(function () {
                    _fadeoutMsg();
                }, delay, false);
            }
        };

        function _fadeoutMsg() {
            $element.addClass('fade-out');
            timer = $timeout(function () {
                $ctrl.msg = '';
                timer = null;
                $element.css('display', 'none');
            }, 5000, false);
        }

    }

})();
