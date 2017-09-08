(function () {

    'use strict';

    angular
        .module('doorayWebApp.stream')
        .component('doorayStreamMailItem', {
            controller: DoorayStreamMailItem,
            templateUrl: 'modules/stream/list/item/doorayStreamMailItem/doorayStreamMailItem.html',
            bindings: {
                streamItem: '<',
                viewMailContent: '&'
            }
        });

    /* @ngInject */
    function DoorayStreamMailItem(DateConvertUtil, MailDisplayHelperFactory, MailsBiz, WriteformModal) {
        var $ctrl = this;

        $ctrl.moveMail = moveMail;

        $ctrl.isRead = isRead;
        $ctrl.openNewWriteFormMail = openNewWriteFormMail;
        $ctrl.viewContent = viewContent;

        _init();

        function isRead(streamItem) {
            return streamItem.mail.read;
        }

        function openNewWriteFormMail(type, mail) {
            WriteformModal.openMail(type, mail);
        }

        function viewContent() {
            $ctrl.viewMailContent({streamItem: $ctrl.streamItem});
        }

        function _init() {
            var streamItem = $ctrl.streamItem;
            $ctrl.mail = streamItem._wrap.refMap.mailMap(streamItem.mail.id);
            streamItem._getOrSetProp('actionAt', DateConvertUtil.convertDateTimeInView($ctrl.mail.createdAt));
            MailDisplayHelperFactory.assignDisplayPropertiesInStream($ctrl.mail);
            $ctrl.streamItem.data = $ctrl.mail;
        }

        function moveMail(target) {
            MailsBiz.moveMails([$ctrl.mail.id], target);
        }
    }
})();
