(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('selectPriority', {
            templateUrl: 'modules/project/components/selectPriority/selectPriority.html',
            controller: SelectPriority,
            bindings: {
                priority: '='
            }
        });

    /* @ngInject */
    function SelectPriority(PriorityUtil) {
        var $ctrl = this;

        $ctrl.priorityOptions = _.map(['none', 'highest', 'high', 'normal', 'low', 'lowest'], function (value) {
            return {
                name: PriorityUtil.getIcon(value, {'default': true}) + PriorityUtil.getLabel(value),
                code: value
            };
        });
    }

})();
