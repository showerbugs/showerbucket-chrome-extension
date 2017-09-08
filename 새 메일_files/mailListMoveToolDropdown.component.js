(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailListMoveToolDropdown', {
            templateUrl: 'modules/mail/contents/listToolBtns/mailListMoveToolDropdown/mailListMoveToolDropdown.html',
            controller: MailListMoveToolDropdown,
            bindings: {
                systemFolders: '<',
                userFolders: '<',
                ngDisabled: '<',
                currentFolderId: '<'       // $onChanges를 호출시키기 위한 변수
            }
        });

    /* @ngInject */
    function MailListMoveToolDropdown(MailFolderUtil, StateHelperUtil,
                                       MailListItemCheckboxRepository,
                                       MailItemsAction, _) {
        var $ctrl = this,
            allDisplayFolders = [];

        $ctrl.moveMails = moveMails;

        this.$onChanges = function (changes) {
            if (!$ctrl.systemFolders || !$ctrl.userFolders) {
                return;
            }

            if (changes.systemFolders || changes.userFolders) {
                allDisplayFolders = _.reject(MailFolderUtil.createDisplayAllFoldersFlatten($ctrl.systemFolders, $ctrl.userFolders), MailFolderUtil.isForbiddenMailMoveByDisplayFolder);
            }

            if (allDisplayFolders) {
                $ctrl.moveTargetFolders = _.filter(allDisplayFolders, function (displayFolder) {
                    return displayFolder.stateName !== StateHelperUtil.computeCurrentListStateName() &&
                        _.get(displayFolder, 'folder.id') !== $ctrl.currentFolderId;
                });
            }
        };

        function moveMails(target) {
            MailItemsAction.moveTargetFolder(MailListItemCheckboxRepository.getCheckedAllItems(), target);
        }
    }

})();
