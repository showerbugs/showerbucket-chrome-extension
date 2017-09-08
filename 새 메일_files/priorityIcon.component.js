(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('priorityIcon', {
            templateUrl: 'modules/project/components/priorityIcon/priorityIcon.html',
            controller: PriorityIcon,
            bindings: {
                priority: '<',
                showDefaultIcon: '@'
            }
        });

    /* @ngInject */
    function PriorityIcon(PriorityUtil) {
        var $ctrl = this;
        this.$onChanges = function () {
            $ctrl.icon = PriorityUtil.getIcon($ctrl.priority, {'default': angular.fromJson($ctrl.showDefaultIcon)});
        };
    }

})();
