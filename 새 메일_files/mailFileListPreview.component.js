(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailFileListPreview', {
            templateUrl: 'modules/mail/view/bodyItems/mailFileListPreview/mailFileListPreview.html',
            controller: MailFileListPreview,
            bindings: {
                fileList: '<'
            }
        });

    /* @ngInject */
    function MailFileListPreview(Lightbox) {
        var $ctrl = this;

        this.$onInit = function () {
            $ctrl.openLightboxModal = openLightboxModal;
        };

        this.$onChanges = function (changes) {
            if (changes.fileList && changes.fileList.currentValue) {
                $ctrl.previewImageFileList = _filterEnablePreviewImageList(changes.fileList.currentValue);
            }
        };

        function openLightboxModal(index) {
            Lightbox.openModal($ctrl.previewImageFileList, index);
        }

        function _filterEnablePreviewImageList(fileList) {
            return _(fileList).filter(function (file) {
                return file && file.downloadUrl && file.mimeType.indexOf('image') >= 0;
            }).map(function (file) {
                return {
                    caption: file.name,
                    url: _.includes(['image/jpeg', 'image/pjpeg', 'image/gif', 'image/png'], file.mimeType) ? //jpeg, gif, png만 허용하고 그 외에는 no_image_available.png
                        file.downloadUrl : '/assets/images/no_image_available.png'
                };
            }).value();
        }

    }

})();
