(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailNaviSystemFolders', {
            templateUrl: 'modules/mail/navi/mailNaviSystemFolders/mailNaviSystemFolders.html',
            controller: MailNaviSystemFolders,
            bindings: {
                folders: '<'
            }
        });

    /* @ngInject */
    function MailNaviSystemFolders(MailFolderUtil, MailNaviUtil,
                                    MailItemsAction,
                                    MailFolderRepository) {
        var $ctrl = this;
        $ctrl.MailNaviUtil = MailNaviUtil;
        $ctrl.dropMailOnlyValidateHandler = dropMailOnlyValidateHandler;
        $ctrl.onDropMail = onDropMail;

        this.$onChanges = function (changes) {
            if (changes.folders.currentValue) {
                $ctrl.items = MailFolderUtil.createDisplaySystemFolders(changes.folders.currentValue);
            }
        };

        function dropMailOnlyValidateHandler($data, $dropItem/*, $event*/) {
            return $data.type === 'mail' && !$dropItem.forbiddenMailMove;
        }

        function onDropMail($data, $dropItem/*, $event*/) {
            if (dropMailOnlyValidateHandler($data, $dropItem) && !_.isEmpty($data.items)) {
                MailItemsAction.moveTargetFolder(_.map($data.items, 'id'), {targetFolderId: $dropItem.folder.id})
                    .then(MailFolderRepository.fetchAndCacheUserFolders);
            }

        }
    }

})();
