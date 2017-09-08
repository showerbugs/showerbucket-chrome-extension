(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailWriteformAttachedFileList', {
            templateUrl: 'modules/mail/writeform/mailWriteformAttachedFileList/mailWriteformAttachedFileList.html',
            controller: MailWriteformAttachedFileList,
            bindings: {
                mailId: '<',
                flowFiles: '<',
                attachedFiles: '<',
                attachmentSettings: '<',
                onRemovedFiles: '&'
            }
        });

    /* @ngInject */
    function MailWriteformAttachedFileList(FlowFileAction, MailDraftFileAction, moment) {
        var $ctrl = this;
        $ctrl.FlowFileAction = FlowFileAction;
        $ctrl.MailDraftFileAction = MailDraftFileAction;

        $ctrl.getRetentionDayGuideInFileList = getRetentionDayGuideInFileList;
        $ctrl.removeMimeFile = removeMimeFile;
        $ctrl.removeBigFile = removeBigFile;

        function getRetentionDayGuideInFileList() {
            return moment().add($ctrl.attachmentSettings.bigfile.retentionPeriodDays, 'days').format('YYYY.MM.DD');
        }

        function removeMimeFile(filePartNumber) {
            return MailDraftFileAction.removeMimeFile($ctrl.mailId, filePartNumber).then(function (res) {
                $ctrl.onRemovedFiles();
                return res;
            });
        }

        function removeBigFile(fileId) {
            return MailDraftFileAction.removeBigFile($ctrl.mailId, fileId).then(function (res) {
                $ctrl.onRemovedFiles();
                return res;
            });
        }

    }

})();
