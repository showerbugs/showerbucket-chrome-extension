(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailNaviUtil', MailNaviUtil);

    /* @ngInject */
    function MailNaviUtil($state, MAIL_STATE_NAMES, MailCountRepository, MessageModalFactory, gettextCatalog) {

        return {
            isActiveBox: isActiveBox,
            getCountByFolderName: getCountByFolderName,
            showUnderConstruction: showUnderConstruction
        };

        function isActiveBox(itemOrStateName) {
            return $state.includes(MAIL_STATE_NAMES.FOLDERS) ? itemOrStateName.id === $state.params.folderId : $state.includes(itemOrStateName);
        }

        function getCountByFolderName(folderName) {
            return folderName ? _.get(MailCountRepository.getModel(), 'counts.folders.' + folderName, 0) : 0;
        }

        function showUnderConstruction() {
            return MessageModalFactory.alert(gettextCatalog.getString('준비 중입니다.'));
        }
    }

})();
