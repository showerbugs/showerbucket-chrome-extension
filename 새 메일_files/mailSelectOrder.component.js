(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailSelectOrder', {
            templateUrl: 'modules/mail/contents/listToolBtns/mailSelectOrder/mailSelectOrder.html',
            controller: MailSelectOrder
        });

    /* @ngInject */
    function MailSelectOrder($state, MailItemsCheckboxRangeAction, MailListRepository, MailListUtil, StateHelperUtil, gettextCatalog, _) {
        var $ctrl = this;
        var defaultOrders = [{
            value: '-createdAt',
            name: gettextCatalog.getString('날짜')
        }, {
            value: 'from',
            name: gettextCatalog.getString('사람')
        }, {
            value: '-mimeSize',
            name: gettextCatalog.getString('크기')
        }];

        $ctrl.isAscOrder = isAscOrder;
        $ctrl.selectMenu = selectMenu;

        this.$onInit = function () {
            var order = $state.params.order || '-createdAt';
            _setOrders(order);
        };

        function isAscOrder(order) {
            return !_.startsWith(order, '-');
        }

        function selectMenu(order) {
            $state.go('.', {order: order}, {reload: false});
            MailItemsCheckboxRangeAction.clearRange();
            MailListRepository.fetchAndCacheWithLoading(MailListUtil.makeApiParams(StateHelperUtil.computeListStateNameByName($state.current.name), $state.params));
            _setOrders(order);
        }

        function _setOrders(orderValue) {
            var trimmedValue = _.trimStart(orderValue, '-');
            $ctrl.orders = _.map(_.cloneDeep(defaultOrders), function (order) {
                if (_.trimStart(order.value, '-') === trimmedValue) {
                    $ctrl.currentOrder = _.cloneDeep(order);
                    $ctrl.currentOrder.value = orderValue;
                    order.value = isAscOrder(orderValue) ? ('-' + orderValue) : trimmedValue;
                }
                return order;
            });
        }

    }

})();
