(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('priorityWidget', {
            templateUrl: 'modules/project/view/dashBoard/widget/priorityWidget/priorityWidget.html',
            controller: priorityWidget,
            require: {
                dashboard: '^dashBoard'
            }
        });

    /* @ngInject */
    function priorityWidget(PermissionFactory, PriorityRepository, PriorityUtil, StateParamsUtil) {
        var $ctrl = this;
        $ctrl.priorityList = ['highest', 'high', 'normal', 'low', 'lowest'];
        $ctrl.PriorityUtil = PriorityUtil;
        $ctrl.getDescription = getDescription;

        this.$onInit = function () {
            $ctrl.isProjectAdmin = PermissionFactory.isProjectAdmin();
            PriorityRepository.fetchAndCache({projectCode: StateParamsUtil.getProjectCodeFilter()});
        };

        function getDescription(priority) {
            if (PriorityRepository.getCurrentParam().projectCode === StateParamsUtil.getProjectCodeFilter()) {
                return PriorityRepository.getModel().value[priority] || PriorityUtil.getDefaultDescription(priority);
            }
            return PriorityUtil.getDefaultDescription(priority);
        }
    }

})();
