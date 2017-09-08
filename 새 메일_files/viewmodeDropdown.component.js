(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('viewmodeDropdown', {
            templateUrl: 'modules/mail/contents/viewmodeDropdown/viewmodeDropdown.html',
            controller: ViewmodeDropdown,
            bindings: {
                item: '<'
            }
        });

    /* @ngInject */
    function ViewmodeDropdown(CONTENT_LAYOUT_MODE, MainContentsViewModeRepository) {
        var $ctrl = this;
        $ctrl.CONTENT_LAYOUT_MODE = CONTENT_LAYOUT_MODE;
        $ctrl.MainContentsViewModeRepository = MainContentsViewModeRepository;

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
