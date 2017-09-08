(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('PriorityUtil', PriorityUtil);

    /* @ngInject */
    function PriorityUtil(gettextCatalog) {
        var priorityMap = {
            none: {
                label: gettextCatalog.getString('없음'),
                icon: '<span class="priority-image dcon-com-priority"></span>'
            },
            highest: {
                label: gettextCatalog.getString('매우 높음'),
                icon: '<span class="priority-image dcon-com-priority-1"></span>',
                description: gettextCatalog.getString('예) 지금 당장 처리해야 하는 긴급한 업무')
            },
            high: {
                label: gettextCatalog.getString('높음'),
                icon: '<span class="priority-image dcon-com-priority-2"></span>',
                description: gettextCatalog.getString('예) 이번 주까지 처리해야 하는 중요한 업무')
            },
            normal: {
                label: gettextCatalog.getString('보통'),
                icon: '<span class="priority-image dcon-com-priority-3"></span>',
                description: gettextCatalog.getString('예) 이번 달까지 처리해야 하는 업무')
            },
            low: {
                label: gettextCatalog.getString('낮음'),
                icon: '<span class="priority-image dcon-com-priority-4"></span>',
                description: gettextCatalog.getString('예) 시간이 될 때 처리해도 되는 업무')
            },
            lowest: {
                label: gettextCatalog.getString('매우 낮음'),
                icon: '<span class="priority-image dcon-com-priority-5"></span>',
                description: gettextCatalog.getString('예) 꼭 처리하지 않아도 되는 업무')
            }
        };

        return {
            getLabel: getLabel,
            getIcon: getIcon,
            getDefaultDescription: getDefaultDescription
        };

        function getLabel(priority) {
            return priorityMap[priority || 'none'].label;
        }

        // option = {default: true}
        function getIcon(priority, option) {
            if(priority === 'none') {
                return option.default? priorityMap.none.icon : '';
            }
            return _.get(priorityMap[priority], 'icon');
        }

        function getDefaultDescription(priority) {
            return priorityMap[priority || 'none'].description || '';
        }
    }

})();
