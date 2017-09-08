(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailUserReceiptDateItem', {
            templateUrl: 'modules/mail/contents/items/mailUserReceiptDateItem/mailUserReceiptDateItem.html',
            controller: MailUserReceiptDateItem,
            bindings: {
                receipt: '<',
                renderOnlyDateProperty: '@?'
            }
        });

    /* @ngInject */
    function MailUserReceiptDateItem(MailListUtil, gettextCatalog) {
        var $ctrl = this;

        $ctrl.getDisplayDeliveryStatusName = function () {
            return $ctrl.renderOnlyDateProperty ?
                _getDatePropertyFormat($ctrl.renderOnlyDateProperty) :
                _getDeliveryStateName();
        };

        function _getDeliveryStateName() {
            switch ($ctrl.receipt.deliveryState) {
                case '0.0.0':
                    // mailState가 read이고 deliveryState가 0.0.0인 경우는 에러 상황(account api)이나 사용자는 정상적으로 읽은 상태여서 읽음처리
                    // 부릉과 협의한 사항 https://nhnent.dooray.com/project/projects/dooray-qa/2247
                    return $ctrl.receipt.mailState === 'read' ?
                        (_getDatePropertyFormat('mailStateUpdatedAt') || gettextCatalog.getString('알수없음')) :
                        gettextCatalog.getString('발송 중');
                case '2.5.0':
                    if ($ctrl.receipt.mailState === 'unknown') {
                        return '-';
                    }
                    return $ctrl.receipt.mailState === 'read' ?
                        (_getDatePropertyFormat('mailStateUpdatedAt') || gettextCatalog.getString('알수없음')) :
                        ($ctrl.receipt.mailState === 'unread' ? gettextCatalog.getString('읽지 않음') : gettextCatalog.getString('알수없음'));
                default:
                    return gettextCatalog.getString('발송 실패');
            }
        }

        function _getDatePropertyFormat(dateProperty) {
            return $ctrl.receipt[dateProperty] ? MailListUtil.makeDateTimeByTarget($ctrl.receipt, dateProperty) : '';
        }
    }

})();
