(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailRepositoryItemPropertySyncAction', MailRepositoryItemPropertySyncAction);

    /* @ngInject */
    function MailRepositoryItemPropertySyncAction(MailItemPropertyUtil,
                                                  MailListRepository,
                                                  MailContentsViewRepository,
                                                  MailStreamViewRepository, _) {
        return {
            syncListRepositoryItemReadFlag: syncListRepositoryItemReadFlag,
            syncAllRepositoryItemFavoritesFlag: syncAllRepositoryItemFavoritesFlag
        };

        function syncListRepositoryItemReadFlag(mailIdList, read) {
            var mailList = MailListRepository.getContents();
            _.forEach(_.map(mailIdList, MailListRepository.getContentById), function (mail) {
                MailItemPropertyUtil.getOrSetReadFlag(mail, read); //prefetch for view ui-sync
            });
            MailListRepository.replaceContents(mailList);
        }

        function syncAllRepositoryItemFavoritesFlag(mailId, isFavorited) {

            MailItemPropertyUtil.getOrSetFavoriteFlag(MailListRepository.getContentById(mailId), isFavorited);
            MailListRepository.replaceContents(MailListRepository.getContents());

            if (!_.isEmpty(MailContentsViewRepository.getContent())) {
                MailItemPropertyUtil.getOrSetFavoriteFlag(MailContentsViewRepository.getContent(), isFavorited);
                MailContentsViewRepository.replaceContent(MailContentsViewRepository.getContent());
            }

            if (!_.isEmpty(MailStreamViewRepository.getContent())) {
                MailItemPropertyUtil.getOrSetFavoriteFlag(MailStreamViewRepository.getContent(), isFavorited);
                MailStreamViewRepository.replaceContent(MailStreamViewRepository.getContent());
            }
        }
    }

})();
