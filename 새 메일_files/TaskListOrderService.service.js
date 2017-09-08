(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .service('TaskListOrderService', TaskListOrderService);

    /* @ngInject */
    function TaskListOrderService($state, PROJECT_STATE_NAMES, CommonItemList, TaskSearchParamStorage, TaskListMenuFactory, _) {
        var orderService = {
            ui: {
                orders: [],
                currentOrder: null
            },
            data: {
                currentValue: ''
            },
            selectMenu: selectMenu,
            init: init
        };

        return orderService;

        // ----------- define functions -----------

        function selectMenu(order) {
            var params = _.assign({}, $state.params, order);
            params.page = 1;

            orderService.data.currentValue = order.order;
            init();
            TaskSearchParamStorage.save(params);
            CommonItemList.stateGoWithoutReload('.', params);
        }

        function isSameOrder(value, other) {
            return _.isEqual(_.trim(value, '-'), _.trim(other, '-'));
        }

        function reverseOrderValue(value) {
            return _.startsWith(value, '-') ? _.trim(value, '-') : '-' + value;
        }

        function initSelectedOrderItem(orderItem, option) {
            // option: {value: 'updatedAt', reverse: true}
            orderItem.value.order = option.value || orderItem.value.order;
            orderItem.reverse = _.startsWith(orderItem.value.order, '-');

            orderItem.value.order = option.reverse ? reverseOrderValue(orderItem.value.order) : orderItem.value.order;
            orderItem.selected = true;
            return orderItem;
        }

        function init() {
            var currentOrderValue = orderService.data.currentValue;
            orderService.ui.orders = $state.includes(PROJECT_STATE_NAMES.COMMENT_BOX) ? [] :
                TaskListMenuFactory.getOrderMenus($state.includes(PROJECT_STATE_NAMES.TO_BOX) || _.startsWith(currentOrderValue, 'userWorkflow'));

            _.forEach(orderService.ui.orders, function (order) {
                var orderValue = order.value.order;
                if (!isSameOrder(orderValue, currentOrderValue)) {
                    order.selected = false;
                    return;
                }

                orderService.ui.currentOrder = initSelectedOrderItem(order, {value: currentOrderValue});
                initSelectedOrderItem(order, {reverse: true});

                // 현재는 1개만 있어서 아래처럼 진행
                order.groupFilter[0].params.reverse = currentOrderValue !== orderValue;
                CommonItemList.init(order.groupFilter);
            });
        }
    }

})();
