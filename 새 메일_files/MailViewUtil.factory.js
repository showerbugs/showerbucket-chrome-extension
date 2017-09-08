(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailViewUtil', MailViewUtil);

    /* @ngInject */
    function MailViewUtil(MAIL_STATE_NAMES, MailFolderUtil, MailItemSecurityUtil, MailListStateMetaUtil, _) {
        var defaultKey = 'defaultInfo',
            actionButtonOpts = _makeActionButtonOpts();

        return {
            makeClassifyParam: makeClassifyParam,
            getDisplayDateInBox: getDisplayDateInBox,
            getActionButtonOpts: getActionButtonOpts
        };

        function makeClassifyParam(mail) {
            var mailUsers = mail.users;

            return _(mailUsers.from).concat(mailUsers.to, mailUsers.cc).map(function (user) {
                return user[user.type].emailAddress;
            }).value();
        }

        function getDisplayDateInBox(mail) {
            return _.get(mail, MailListStateMetaUtil.getDisplayTargetInItem(_extractStateName(mail)).dateTime);
        }

        function _extractStateName(mail) {
            var folder = mail._wrap.refMap.folderMap(mail.folderId);
            return MailFolderUtil.getStateNameByFolder(folder);
        }

        function getActionButtonOpts(mailItem) {
            var listStateName = _extractStateName(mailItem);
            var viewActionButtonOpts = actionButtonOpts[listStateName] || actionButtonOpts[defaultKey];

            //listStateName에 따라 기본 ActionButton 값을 가져온 후 보안 설정 + 재전송 금지에 따라 추가 필터링을 진행함
            if (mailItem.mail.security && !MailItemSecurityUtil.isNormal(mailItem.mail.security.level) && !mailItem.mail.security.resend) {
                //보낸 메일함, 보관 메일함, 받은 메일함 내폴더 스마트 폴더 - 전달 금지 업무등록 금지
                //임시 보관함 스팸 메일함, 휴지통 - 기본설정 유지
                switch (listStateName) {
                    case MAIL_STATE_NAMES.INBOX:
                    case MAIL_STATE_NAMES.SENT_BOX:
                    case MAIL_STATE_NAMES.ARCHIVE_BOX:
                    case MAIL_STATE_NAMES.FOLDERS:
                        return _.assign({}, viewActionButtonOpts, {forward: false, registerTask: false});
                    default:
                        return _.assign({}, viewActionButtonOpts);
                }
            }
            return viewActionButtonOpts;
        }

        //메일 본문 상단 툴바 Action 기능 사용 여부
        function _makeActionButtonOpts() {
            var actionButtonOpts = {};
            var defaultToolbarButtons = {
                //메일 쓰기 - 답장/전체답장 재전송 전달
                reply: true,
                replyAll: true,
                reSend: false,
                forward: true,

                //임시자정 - 이어쓰기 임시저장 삭제
                continueWrite: false,
                removeDraft: false,

                //추가 작업 - 업무 등록, 메일 삭제
                registerTask: true,
                remove: true,
                favorite: true
            };
            actionButtonOpts[defaultKey] = defaultToolbarButtons;
            actionButtonOpts[MAIL_STATE_NAMES.SENT_BOX] = _.assign({}, defaultToolbarButtons, {
                reply: false,
                replyAll: false,
                reSend: true
            });
            actionButtonOpts[MAIL_STATE_NAMES.DRAFT_BOX] = _.assign({}, defaultToolbarButtons, {
                reply: false,
                replyAll: false,
                forward: false,

                continueWrite: true,
                removeDraft: true,

                registerTask: false,
                remove: false
            });
            actionButtonOpts[MAIL_STATE_NAMES.SPAM_BOX] = _.assign({}, defaultToolbarButtons, {
                replyAll: 'disabled',

                registerTask: false,
                remove: false
            });
            actionButtonOpts[MAIL_STATE_NAMES.ARCHIVE_BOX] = _.assign({}, defaultToolbarButtons, {});
            actionButtonOpts[MAIL_STATE_NAMES.TRASH_BOX] = _.assign({}, defaultToolbarButtons, {
                replyAll: 'disabled',

                registerTask: false,
                remove: false
            });
            return actionButtonOpts;
        }
    }

})();
