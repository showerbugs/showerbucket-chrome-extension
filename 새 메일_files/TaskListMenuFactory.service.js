(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .service('TaskListMenuFactory', TaskListMenuFactory);

    /* @ngInject */
    function TaskListMenuFactory(gettextCatalog) {
        function makeFilter(name, filterName, filterValue) {
            var filter = {
                name: name,
                filter: {}
            };
            filter.filter[filterName] = filterValue;

            return filter;
        }

        function makeOrder(name, value, groupFilter) {
            return {
                name: name,
                value: {order: value},
                groupFilter: groupFilter
            };
        }

        function makeGroupFilter(name, params) {
            return {
                name: name,
                params: params
            };
        }

        function makeGroupFilterParams(target, type) {
            return {
                'target': target,
                'type': type
            };
        }

        var groupFilters = {
            filterDue: [makeGroupFilter('postGroup', makeGroupFilterParams('dueDate', 'FUTURE'))],
            filterCreate: [makeGroupFilter('postGroup', makeGroupFilterParams('createdAt', 'PAST'))],
            filterWorkFlow: [makeGroupFilter('postWorkflowGroup', makeGroupFilterParams('post'))],
            filterMyInfoWorkFlow: [makeGroupFilter('postWorkflowGroup', makeGroupFilterParams('myInfo'))],
            filterUpdate: [makeGroupFilter('postGroup', makeGroupFilterParams('updatedAt', 'PAST'))]
        };

        // 반환할 때마다 새로운 배열을 반환해줘서 반환값을 항상 같게 만듬
        return {
            getOrderMenus: function (isUserWorkflowClass) {
                var orders = [makeOrder(gettextCatalog.getString('등록일순'), '-createdAt', groupFilters.filterCreate),
                    makeOrder(gettextCatalog.getString('업데이트순'), '-postUpdatedAt', groupFilters.filterUpdate),
                    makeOrder(gettextCatalog.getString('완료일순'), 'postDueAt', groupFilters.filterDue)];

                orders.push(isUserWorkflowClass ?
                    makeOrder(gettextCatalog.getString('상태순'), 'userWorkflowClass', groupFilters.filterMyInfoWorkFlow) :
                    makeOrder(gettextCatalog.getString('상태순'), 'postWorkflowClass', groupFilters.filterWorkFlow));
                return orders;
            },
            getUserWorkflowFilterMenus: function () {
                return [
                    makeFilter(gettextCatalog.getString('전체'), 'userWorkflowClass', 'all'),
                    makeFilter(['<span class="workflow-badge registered">', gettextCatalog.getString('등록'), '</span>'].join(''), 'userWorkflowClass', 'registered'),
                    makeFilter(['<span class="workflow-badge working">', gettextCatalog.getString('진행'), '</span>'].join(''), 'userWorkflowClass', 'working'),
                    makeFilter(['<span class="workflow-badge closed">', gettextCatalog.getString('완료'), '</span>'].join(''), 'userWorkflowClass', 'closed')
                ];
            },
            getTaskWorkflowFilterMenus: function () {
                return [
                    makeFilter(gettextCatalog.getString('전체'), 'postWorkflowClass', 'all'),
                    makeFilter(['<span class="workflow-badge registered">', gettextCatalog.getString('등록'), '</span>'].join(''), 'postWorkflowClass', 'registered'),
                    makeFilter(['<span class="workflow-badge working">', gettextCatalog.getString('진행'), '</span>'].join(''), 'postWorkflowClass', 'working'),
                    makeFilter(['<span class="workflow-badge closed">', gettextCatalog.getString('완료'), '</span>'].join(''), 'postWorkflowClass', 'closed')
                ];
            },
            getDueDateMenus: function () {
                return [
                    makeFilter(gettextCatalog.getString('전체'), 'dueDate', 'all'),
                    makeFilter(gettextCatalog.getString('지남'), 'dueDate', 'overdue'),
                    makeFilter(gettextCatalog.getString('이전'), 'dueDate', 'undue'),
                    makeFilter(gettextCatalog.getString('미정'), 'dueDate', 'unplanned')
                ];
            }
        };
    }

})();
