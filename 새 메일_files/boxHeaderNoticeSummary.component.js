(function () {

    'use strict';

    angular
        .module('doorayWebApp.layout')
        .component('boxHeaderNoticeSummary', {
            templateUrl: 'modules/layouts/main/boxHeaderNoticeSummary/boxHeaderNoticeSummary.html',
            controller: BoxHeaderNoticeSummary,
            bindings: {
                checkedItemSize: '<'
            }
        });

    /* @ngInject */
    function BoxHeaderNoticeSummary(NoticeSummaryService, gettextCatalog) {
        var $ctrl = this;

        $ctrl.checkedItemMsg = '';
        $ctrl.NoticeSummaryService = NoticeSummaryService;

        this.$onInit = function () {
        };

        this.$onChanges = function () {
            NoticeSummaryService.resetMessage();
            if ($ctrl.checkedItemSize > 1) {
                $ctrl.checkedItemMsg = $ctrl.checkedItemSize + gettextCatalog.getString('개 업무가 선택되었습니다.');
            }
        };

        this.$onDestroy = function () {
        };

    }

})();
