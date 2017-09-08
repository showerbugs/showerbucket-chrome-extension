(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailContentsView', {
            templateUrl: 'modules/mail/view/mailContentsView/mailContentsView.html',
            controller: MailContentsView,
            bindings: {
                closeModal: '&?' // full view의 modal일 경우에만 사용
            }
        });

    /* @ngInject */
    function MailContentsView($element, $scope, $state,
                              MAIL_SCREEN_MODE, MAIL_STATE_NAMES,
                              BrowserTitleChangeAction, EmailAddressClassifyBiz, MailRepositoryItemPropertySyncAction,
                              MailContentsViewRepository, MailResizeDividerRepository, MailAttachmentSettingsRepository,
                              MailAttachedFileUtil, MailDividerUtil, MailFolderUtil, MailItemSecurityUtil, MailViewUtil, PopupUtil, StateHelperUtil,
                              _) {
        var $ctrl = this;
        $ctrl.contentVersion = 0;
        $ctrl.menuTranslationInfo = null;

        $ctrl.actionButtonOpts = null;
        $ctrl.MailContentsViewRepository = MailContentsViewRepository;
        $ctrl.MailAttachmentSettingsRepository = MailAttachmentSettingsRepository;
        $ctrl.MailItemSecurityUtil = MailItemSecurityUtil;

        $ctrl.getDisplayDateInBox = getDisplayDateInBox;
        $ctrl.isFullScreenMode = isFullScreenMode;
        $ctrl.isDraftBox = isDraftBox;
        $ctrl.toggleScreenMode = toggleScreenMode;
        $ctrl.setTranslationInfo = setTranslationInfo;
        $ctrl.openTranslator = openTranslator;

        //TODO REMOVE 서버에서 a 태그에 대해 _blank target을 생성해 줌 by 만티
        $ctrl.onLoadComplete = onLoadComplete;
        //Mail Content View에서 HTML 렌더링완료 DOM TREE 추가된 이후에 호출되는 콜백으로 본문 내용의 링크를 모두 새창으로 설정함
        //$ctrl.onLoadComplete = function (target) {
        //    target.element.find('a[href]').each(function (i, el) {
        //        angular.element(el).attr('target', '_blank');
        //    });
        //};

        this.$onInit = function () {
            $ctrl.uniqViewName = 'mailContentsView';
            $ctrl.viewDivider = MailResizeDividerRepository.getDivider(MailResizeDividerRepository.DIVIDER_TYPES.VIEW);

            _fetchMail().then(function (result) {
                // MAIL_STATE_NAMES.VIEW 일 경우 메일을 먼저 얽어온 후 폴더id에 해당하는 메일함으로 리다이렉트함 (메신저 - 메일 스트림의 링크로 유입)
                if (StateHelperUtil.getCurrentStateName() === MAIL_STATE_NAMES.VIEW) {
                    var folder = result.refMap.folderMap(result.contents().folderId);
                    var stateName = MailFolderUtil.getStateNameByFolder(folder);
                    var params = {mailId: result.contents().id};
                    params = MailFolderUtil.isUserFolder(folder) ? _.assign({folderId: result.contents().folderId}, params) : params;
                    return $state.go(StateHelperUtil.computeViewStateNameByName(stateName), params, {
                        inherit: false,
                        location: 'replace'
                    });
                }
            });

            MailAttachmentSettingsRepository.fetchAndCache();

            $scope.$on('$stateChangeSuccess', function (event, toState) {
                // #dooray-메일/310 mailId 비교가 동일 메일 선택시 fetch 허용 (/mail/mails/{id} -> /mail/system/{boxname}/{id} 로 redirect 되었을 때 이중 호출 허용)
                if (StateHelperUtil.isViewStateByName(toState.name)/* && _.get(toParams, 'mailId') !== _.get(fromParams, 'mailId')*/) {
                    _fetchMail();
                }
            });
        };

        function getDisplayDateInBox() {
            return MailViewUtil.getDisplayDateInBox(MailContentsViewRepository.getContent());
        }

        function isFullScreenMode() {
            return _.get($ctrl.viewDivider, 'screenMode', MAIL_SCREEN_MODE.NORMAL) === MAIL_SCREEN_MODE.FULL;
        }

        function isDraftBox() {
            return StateHelperUtil.computeCurrentListStateName() === MAIL_STATE_NAMES.DRAFT_BOX;
        }

        function toggleScreenMode() {
            MailDividerUtil.toggleScreenMode($ctrl.viewDivider);
        }

        function setTranslationInfo(info) {
            if (_.isNull(info)) {
                _fetchMail();
            }
            if (!_.isEqual($ctrl.translationInfo, info)) {
                $ctrl.translationInfo = _.cloneDeep(info);
            }
        }

        function openTranslator() {
            var ref = PopupUtil.openTranslatorPopup();
            ref.content = $element.find('.dooray-contents')[0].innerText;
        }

        function onLoadComplete() {
            $ctrl.contentVersion += 1;
        }

        function _fetchMail() {
            return MailContentsViewRepository.fetchAndCache({mailId: $state.params.mailId}).then(function (result) {
                var mail = MailContentsViewRepository.getContent();
                $ctrl.actionButtonOpts = MailViewUtil.getActionButtonOpts(mail);

                //#dooray-qa/2135 메일 본문 요청 시 메일 목록도 읽음 처리 UI-SYNC
                MailRepositoryItemPropertySyncAction.syncListRepositoryItemReadFlag([$state.params.mailId], true);

                _fetchClassifyMap(mail);
                _changeBrowserTitle(mail);
                return result;
            }).then(function (result) {
                $ctrl.attachedMimeFileList = MailAttachedFileUtil.filterAttachedMimeFileList(MailContentsViewRepository.getContent().fileList);
                $ctrl.attachedBigFileList = MailAttachedFileUtil.filterAttachedBigFileList(MailContentsViewRepository.getContent().fileList);
                return result;
            });
        }

        // layer에서는 title이 변하면 안됨
        function _changeBrowserTitle(mail) {
            var title = [
                MailFolderUtil.convertDisplayFolderName(mail._wrap.refMap.folderMap(mail.folderId)),
                mail.subject
            ].join(' | ');
            BrowserTitleChangeAction.changeBrowserTitle(title);
        }

        function _fetchClassifyMap(mail) {
            var param = MailViewUtil.makeClassifyParam(mail);

            return EmailAddressClassifyBiz.query(param).then(function (result) {
                $ctrl.classifyMap = result.result();
                return result;
            });
        }
    }

})();
