(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailBoxnameItem', {
            templateUrl: 'modules/mail/contents/items/mailBoxnameItem/mailBoxnameItem.html',
            controller: MailBoxnameItem,
            bindings: {
                mail: '<'
            }
        });

    /* @ngInject */
    function MailBoxnameItem(MailFolderUtil) {
        var $ctrl = this;

        $ctrl.getFolderDisplayName = function () {
            if (_.isUndefined($ctrl.mail)) {
                return undefined;
            }
            var folderMap = _.get($ctrl.mail, '_wrap.refMap.folderMap', angular.noop);
            var folder = folderMap($ctrl.mail.folderId);
            return folder ? MailFolderUtil.convertDisplayFolderName(folder) : '';
        };
    }

})();
