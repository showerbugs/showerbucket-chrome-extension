(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailFileListInView', {
            templateUrl: 'modules/mail/view/bodyItems/mailFileListInView/mailFileListInView.html',
            controller: MailFileListInView,
            transclude: true,
            bindings: {
                fileList: '<'
            }
        });

    /* @ngInject */
    function MailFileListInView(FileService) {
        var $ctrl = this;

        $ctrl.getFileType = getFileType;

        function getFileType(mimeType) {
            return FileService.getFileType(mimeType);
        }
    }

})();
