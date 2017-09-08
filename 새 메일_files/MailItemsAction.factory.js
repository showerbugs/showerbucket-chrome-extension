(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailItemsAction', MailItemsAction);

    /* @ngInject */
    function MailItemsAction($state,
                             HelperPromiseUtil, StateHelperUtil,
                             MessageModalFactory,
                             MailResource, MailReadResource,
                             MailListRepository,
                             MailRepositoryItemPropertySyncAction,
                             gettextCatalog, _) {

        var mailReadResource, mailMoveResource, mailRemoveResource;

        return {
            readMails: readMails,
            unreadMails: unreadMails,
            moveTargetFolder: moveTargetFolder,
            moveInBox: moveInBox,
            moveSpamBox: moveSpamBox,
            moveArchiveBox: moveArchiveBox,
            moveTrashBox: moveTrashBox,
            removePermanent: removePermanent,
            removePermanentWithConfirm: removePermanentWithConfirm,
            fetchScheduleStatus: fetchScheduleStatus
        };

        function readMails(mailIdList) {
            return _requestMailReadApiWithListItemSync(MailReadResource.read, mailIdList, true);
        }

        function unreadMails(mailIdList) {
            return _requestMailReadApiWithListItemSync(MailReadResource.unread, mailIdList, false);
        }

        function _requestMailReadApiWithListItemSync(apiResource, mailIdList, read) {
            if (HelperPromiseUtil.isResourcePending(mailReadResource)) {
                return;
            }
            mailReadResource = apiResource({mailIdList: mailIdList});
            return mailReadResource.$promise.then(function () {
                MailRepositoryItemPropertySyncAction.syncListRepositoryItemReadFlag(mailIdList, read);
            });
        }

        // target: {targetFolderId: '123123213', targetFolderName: 'inbox'} 2개중에 1개가 필요합니다.
        function moveTargetFolder(mailIdList, target) {
            return target.targetFolderName === 'trash' ? moveTrashBox(mailIdList) : _moveFolder(mailIdList, target);
        }

        function moveInBox(mailIdList) {
            return _moveFolder(mailIdList, {targetFolderName: 'inbox'});
        }

        function moveSpamBox(mailIdList) {
            return _moveFolder(mailIdList, {targetFolderName: 'spam'});
        }

        function moveArchiveBox(mailIdList) {
            return _moveFolder(mailIdList, {targetFolderName: 'archive'});
        }

        function moveTrashBox(mailIdList) {
            var target = {targetFolderName: 'trash'};
            if (!_hasFavoritedMails(mailIdList)) {
                return _moveFolder(mailIdList, target);
            }

            var msg = [
                '<p>', gettextCatalog.getString('별표(<span class="v-icons-star"></span>) 메일이 포함되어 있습니다.'), '</p>' +
                '<p>', gettextCatalog.getString('메일을 삭제하시겠습니까?'), '</p>'
            ].join('');
            return MessageModalFactory.confirm(msg, gettextCatalog.getString('별표 메일 삭제'), {
                focusToCancel: true,
                confirmBtnLabel: gettextCatalog.getString('삭제')
            }).result.then(function () {
                    return _moveFolder(mailIdList, target);
                });
        }

        // draft 삭제시 confirm 없이 영구삭제 진행
        function removePermanent(mailIdList) {
            if (HelperPromiseUtil.isResourcePending(mailRemoveResource)) {
                return mailRemoveResource.$promise;
            }
            mailRemoveResource = MailResource.removeArray({mailIdList: mailIdList});
            return mailRemoveResource.$promise.then(_refreshListRepository);
        }

        //추후 다른 action으로 이관
        function fetchScheduleStatus(mailId) {
            return MailResource.fetchSchedule({mailId: mailId}).$promise;
        }

        function removePermanentWithConfirm(mailIdList) {
            var msg = [
                '<p class="text-center">', gettextCatalog.getString('영구 삭제하면 복구할 수 없습니다.'), '</p>',
                '<p class="text-center">', gettextCatalog.getString('메일을 삭제하시겠습니까?'), '</p>'
            ].join('');
            return MessageModalFactory.confirm(msg, gettextCatalog.getString('영구 삭제'), {
                focusToCancel: true,
                confirmBtnLabel: gettextCatalog.getString('영구 삭제')
            }).result.then(function () {
                    return removePermanent(mailIdList);
                });
        }

        function _hasFavoritedMails(mailIdList) {
            return _.some(_.map(mailIdList, MailListRepository.getContentById), {annotations: {favorited: true}});
        }

        function _moveFolder(mailIdList, target) {
            if (HelperPromiseUtil.isResourcePending(mailMoveResource)) {
                return mailMoveResource.$promise;
            }

            mailMoveResource = MailResource.move(_.assign({mailIdList: mailIdList}, target));
            return mailMoveResource.$promise.then(_refreshListRepository);
        }

        function _refreshListRepository() {
            return MailListRepository.fetchAndCache().then(function (res) {
                if (StateHelperUtil.isViewStateByCurrentState()) {
                    $state.go('^');
                }
                return res;
            });
        }
    }

})();
