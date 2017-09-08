(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .component('calendarPrivateSetting', {
            templateUrl: 'modules/setting/user/calendar/calendarPrivateSetting/calendarPrivateSetting.html',
            controller: CalendarPrivateSetting,
            bindings: {
                item: '<'
            }
        });

    /* @ngInject */
    function CalendarPrivateSetting() {
        //var $ctrl = this;

        //PreDefined Callback;

        this.$onInit = function () {

        };

        this.$onChanges = function (/*changes*/) {
        };

        this.$onDestroy = function () {
        };

        //TODO IMPLEMENTS

    }

})();
