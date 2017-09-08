(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailDraftFileAction', MailDraftFileAction);

    /* @ngInject */
    function MailDraftFileAction($q,
                                 MailDraftFileResource, HelperPromiseUtil, MessageModalFactory,
                                 gettextCatalog) {

        var removeActionPromise;
        return {
            fetch: fetch,
            removeBigFile: removeBigFile,
            removeMimeFile: removeMimeFile,
            isPendingRemoveAction: isPendingRemoveAction
        };

        function fetch(draftId) {
            return MailDraftFileResource.get({draftId: draftId}).$promise;
        }

        function removeBigFile(draftId, fileId) {
            return _confirmBeforeRemoveAction().then(function () {
                removeActionPromise = MailDraftFileResource.removeBigFile({
                    draftId: draftId,
                    fileId: fileId
                });
                return removeActionPromise.$promise;
            });
        }

        function removeMimeFile(draftId, filePartNumber) {
            return _confirmBeforeRemoveAction().then(function () {
                removeActionPromise = MailDraftFileResource.remove({
                    draftId: draftId,
                    partNumber: filePartNumber
                });
                return removeActionPromise.$promise;
            });
        }

        function isPendingRemoveAction() {
            return HelperPromiseUtil.isResourcePending(removeActionPromise);
        }

        function _confirmBeforeRemoveAction() {
            if (isPendingRemoveAction()) {
                return $q.reject();
            }
            return MessageModalFactory.confirm(gettextCatalog.getString('해당 파일을 삭제하시겠습니까?')).result;
        }
    }

})();
