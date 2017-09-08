(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailStreamView', {
            templateUrl: 'modules/mail/view/mailStreamView/mailStreamView.html',
            controller: MailStreamView,
            bindings: {
                mail: '<'
            }
        });

    /* @ngInject */
    function MailStreamView($element, EmailAddressClassifyBiz, MailStreamViewRepository,
                            MailAttachedFileUtil, MailItemSecurityUtil, MailViewUtil, PopupUtil) {
        var $ctrl = this;
        $ctrl.contentVersion = 0;
        $ctrl.menuTranslationInfo = null;

        $ctrl.actionButtonOpts = null;
        $ctrl.MailStreamViewRepository = MailStreamViewRepository;
        $ctrl.MailItemSecurityUtil = MailItemSecurityUtil;

        $ctrl.getDisplayDateInBox = getDisplayDateInBox;
        $ctrl.closeModal = closeModal;
        $ctrl.setTranslationInfo = setTranslationInfo;
        $ctrl.openTranslator = openTranslator;

        //Mail Content View에서 HTML 렌더링완료 DOM TREE 추가된 이후에 호출되는 콜백으로 본문 내용의 링크를 모두 새창으로 설정함
        $ctrl.onLoadComplete = function (target) {
            target.element.find('a[href]').each(function (i, el) {
                angular.element(el).attr('target', '_blank');
            });
            $ctrl.contentVersion += 1;
        };

        this.$onInit = function () {
            $ctrl.uniqViewName = 'mailStreamView';
        };

        this.$onChanges = function () {
            $ctrl.actionButtonOpts = MailViewUtil.getActionButtonOpts(MailStreamViewRepository.getContent());
            $ctrl.attachedMimeFileList = MailAttachedFileUtil.filterAttachedMimeFileList(MailStreamViewRepository.getContent().fileList);
            _fetchClassifyMap();
        };

        function getDisplayDateInBox() {
            return MailViewUtil.getDisplayDateInBox(MailStreamViewRepository.getContent());
        }

        function closeModal() {
            MailStreamViewRepository.clear();
        }

        function setTranslationInfo(info) {
            if (_.isNull(info)) {
                MailStreamViewRepository.fetchAndCache({mailId: $ctrl.mail.id});
            }
            if (!_.isEqual($ctrl.translationInfo, info)) {
                $ctrl.translationInfo = _.cloneDeep(info);
            }
        }

        function openTranslator() {
            var ref = PopupUtil.openTranslatorPopup();
            ref.content = $element.find('.dooray-contents')[0].innerText;
        }

        function _fetchClassifyMap() {
            var param = MailViewUtil.makeClassifyParam(MailStreamViewRepository.getContent());

            return EmailAddressClassifyBiz.query(param).then(function (result) {
                $ctrl.classifyMap = result.result();
                return result;
            });
        }
    }

})();
