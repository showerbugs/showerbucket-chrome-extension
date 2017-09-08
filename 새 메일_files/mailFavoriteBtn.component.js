(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailFavoriteBtn', {
            templateUrl: 'modules/mail/components/mailFavoriteBtn/mailFavoriteBtn.html',
            controller: MailFavoriteBtn,
            bindings: {
                mail: '<'
            }
        });

    /* @ngInject */
    function MailFavoriteBtn($state,
                             MAIL_STATE_NAMES,
                             MailListRepository,
                             MailRepositoryItemPropertySyncAction,
                             MailItemPropertyUtil, MailReceiptItemUtil,
                             MarkMailImportantBiz, StreamItemList, _) {
        var $ctrl = this;

        $ctrl.MailItemPropertyUtil = MailItemPropertyUtil;
        $ctrl.MailReceiptItemUtil = MailReceiptItemUtil;
        $ctrl.toggleFavorite = toggleFavorite;

        function toggleFavorite() {
            MarkMailImportantBiz.toggleFavorite($ctrl.mail).then(function () {
                var isFavorited = !MailItemPropertyUtil.getOrSetFavoriteFlag($ctrl.mail);

                MailRepositoryItemPropertySyncAction.syncAllRepositoryItemFavoritesFlag($ctrl.mail.id, isFavorited);

                StreamItemList.applyFunction($ctrl.mail.id, 'mail', function (item) {
                    MailItemPropertyUtil.getOrSetFavoriteFlag(item, isFavorited);
                });

                //별표 메일함에서 체크가 해지된 경우 메일 목록에서 해당 메일을 UI만 제거
                if (!isFavorited && $state.includes(MAIL_STATE_NAMES.IMPORTANT_BOX)) {
                    _.remove(MailListRepository.getContents(), {id: $ctrl.mail.id});
                    MailListRepository.replaceContents(MailListRepository.getContents());
                }
            });
        }

    }

})();
