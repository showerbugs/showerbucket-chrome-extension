(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailContentsFullList', {
            templateUrl: 'modules/mail/contents/mailContentsFullList/mailContentsFullList.html',
            controller: MailContentsFullList
        });

    /* @ngInject */
    function MailContentsFullList(MailListRepository, MailResizeDividerRepository, MailReceiptRepository,
                                   MailListItemDragDropUtil, MailListStateMetaUtil, StateHelperUtil, _) {
        var $ctrl = this;

        $ctrl.MailListRepository = MailListRepository;
        $ctrl.MailReceiptRepository = MailReceiptRepository;
        $ctrl.StateHelperUtil = StateHelperUtil;
        $ctrl.MailListItemDragDropUtil = MailListItemDragDropUtil;
        $ctrl.MailListStateMetaUtil = MailListStateMetaUtil;

        $ctrl.getNaviWidth = getNaviWidth;

        this.$onInit = function () {
        };

        //TODO mailContentsVerticalList의 위상과 맞지 않음
        this.$onChanges = function () {
            //if (!_.isEmpty(_.get(changes.mailList, 'currentValue'))) {
            //    debounceRefreshDisplayMailList();
            //}
            //
            //if (!_.isEmpty(_.get(changes.selectedReceiptList, 'currentValue'))) {
            //    debounceRefreshDisplayMailList();
            //}
        };

        function getNaviWidth() {
            return _.get(MailResizeDividerRepository.getDivider(MailResizeDividerRepository.DIVIDER_TYPES.NAVI), 'viewWidth');
        }
    }

})();
