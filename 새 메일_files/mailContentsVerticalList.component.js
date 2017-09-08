(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailContentsVerticalList', {
            templateUrl: 'modules/mail/contents/mailContentsVerticalList/mailContentsVerticalList.html',
            controller: MailContentsVerticalList,
            bindings: {
                mailList: '<',
                selectedReceiptList: '<'
            }
        });

    /* @ngInject */
    function MailContentsVerticalList($scope, EMIT_EVENTS,
                                      MailListRepository, MailReceiptRepository,
                                      StateHelperUtil, MailListItemDragDropUtil, MailItemPropertyUtil, MailReceiptItemUtil, MailListStateMetaUtil, _) {
        var $ctrl = this;

        $ctrl.StateHelperUtil = StateHelperUtil;
        $ctrl.MailListItemDragDropUtil = MailListItemDragDropUtil;
        $ctrl.MailItemPropertyUtil = MailItemPropertyUtil;
        $ctrl.MailReceiptItemUtil = MailReceiptItemUtil;
        $ctrl.MailListStateMetaUtil = MailListStateMetaUtil;
        $ctrl.MailListRepository = MailListRepository;

        $ctrl.isDraggableMailInFolder = isDraggableMailInFolder;

        this.$onChanges = function (changes) {
            if (_isUpdatedChangesValue(changes.mailList) || _isUpdatedChangesValue(changes.selectedReceiptList)) {
                _refreshDisplayMailList();
            }
        };

        function isDraggableMailInFolder() {
            return MailListItemDragDropUtil.isDraggableItemInStateName(StateHelperUtil.computeCurrentListStateName());
        }

        function _isUpdatedChangesValue(changesValue) {
            return changesValue && !_.isEqual(_.get(changesValue, 'currentValue'), _.get(changesValue, 'previousValue'));
        }

        ///보낸 메일함에서 To가 여러 명일때 기존 메일을 각 멤버별로 보여질 수 있도록 복사본에 각 users.to 정보를 개별로 설정하여 처리함
        function _refreshDisplayMailList() {
            $ctrl.displayMailList = _.assign([], MailListRepository.getContents());

            //보낸 메일함의 여러명인 to에 대한 정보 처리 표시
            _.forEach(MailReceiptRepository.getContentsMap(), function (receiptResult, mailId) {
                $ctrl.displayMailList = MailReceiptItemUtil.injectReceiptInfoToMailList($ctrl.displayMailList, receiptResult, mailId);
            });
            $scope.$emit(EMIT_EVENTS.CUSTOM_DOM_RENDERED);
        }

    }

})();
