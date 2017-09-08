(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailListStateMetaUtil', MailListStateMetaUtil);

    /* @ngInject */
    function MailListStateMetaUtil(MAIL_LIST_ITEM_DISPLAY_TARGET, MAIL_STATE_NAMES, gettextCatalog) {
        var defaultKey = 'defaultInfo',
            boxApiFilters = _makeBoxFilterApis(),
            noItemMessages = _makeNoItemMessages(),

            actionButtonOpts = _makeActionButtonOpts(),
            displayTargetInItems = _makeDisplayTargetInItems();

        return {
            getBoxApiFilter: getBoxApiFilter,
            getNoItemMessage: getNoItemMessage,
            getActionButtonOpts: getActionButtonOpts,
            getDisplayTargetInItem: getDisplayTargetInItem
        };

        function getBoxApiFilter(listStateName) {
            return boxApiFilters[listStateName] || boxApiFilters[defaultKey];
        }

        function getNoItemMessage(listStateName) {
            return noItemMessages[listStateName] || noItemMessages[defaultKey];
        }

        function getActionButtonOpts(listStateName) {
            return actionButtonOpts[listStateName] || actionButtonOpts[defaultKey];
        }

        function getDisplayTargetInItem(listStateName) {
            return displayTargetInItems[listStateName] || displayTargetInItems[defaultKey];
        }

        function _makeBoxFilterApis() {
            var boxApiFilters = {};
            boxApiFilters[defaultKey] = {};
            boxApiFilters[MAIL_STATE_NAMES.INBOX] = {folderName: 'inbox'};
            boxApiFilters[MAIL_STATE_NAMES.SENT_BOX] = {folderName: 'sent'};
            boxApiFilters[MAIL_STATE_NAMES.DRAFT_BOX] = {folderName: 'draft'};
            boxApiFilters[MAIL_STATE_NAMES.SPAM_BOX] = {folderName: 'spam'};
            boxApiFilters[MAIL_STATE_NAMES.TRASH_BOX] = {folderName: 'trash'};
            boxApiFilters[MAIL_STATE_NAMES.ARCHIVE_BOX] = {folderName: 'archive'};
            boxApiFilters[MAIL_STATE_NAMES.IMPORTANT_BOX] = {favorited: true, exceptFolders: 'spam,trash'};
            boxApiFilters[MAIL_STATE_NAMES.NEW_BOX] = {read: false, exceptFolders: 'sent,draft,spam,trash,archive'};
            boxApiFilters[MAIL_STATE_NAMES.ATTACHMENT_BOX] = {hasAttachment: true, exceptFolders: 'spam,trash'};
            return boxApiFilters;
        }

        function _makeNoItemMessages() {
            var noItemMessages = {};
            noItemMessages[defaultKey] = gettextCatalog.getString('메일이 없습니다.');
            noItemMessages[MAIL_STATE_NAMES.INBOX] = gettextCatalog.getString('받은 메일이 없습니다.');
            noItemMessages[MAIL_STATE_NAMES.SENT_BOX] = gettextCatalog.getString('보낸 메일이 없습니다.');
            noItemMessages[MAIL_STATE_NAMES.DRAFT_BOX] = gettextCatalog.getString('보관 중인 메일이 없습니다.');
            noItemMessages[MAIL_STATE_NAMES.SEARCH_BOX] = gettextCatalog.getString('검색 결과가 없습니다.');
            return noItemMessages;
        }

        //메일 목록 상단 툴바 Action 기능 사용 여부
        function _makeActionButtonOpts() {
            var actionButtonOpts = {};
            var defaultToolbarButtons = {
                favorite: true,
                store: true,
                spam: true,
                read: true,
                move: true,
                remove: true,
                removeDraft: false
            };
            actionButtonOpts[defaultKey] = defaultToolbarButtons;
            actionButtonOpts[MAIL_STATE_NAMES.SENT_BOX] = _.assign({}, defaultToolbarButtons, {
                spam: false,
                move: false
            });
            actionButtonOpts[MAIL_STATE_NAMES.DRAFT_BOX] = _.assign({}, defaultToolbarButtons, {
                store: false,
                spam: false,
                move: false,
                remove: false,
                removeDraft: true
            });
            actionButtonOpts[MAIL_STATE_NAMES.SPAM_BOX] = _.assign({}, defaultToolbarButtons, {
                store: false,
                spam: false,
                notSpam: true,
                permanentRemove: true,
                remove: false
            });
            actionButtonOpts[MAIL_STATE_NAMES.ARCHIVE_BOX] = _.assign({}, defaultToolbarButtons, {
                store: false
            });
            actionButtonOpts[MAIL_STATE_NAMES.TRASH_BOX] = _.assign({}, defaultToolbarButtons, {
                store: false,
                remove: false,
                permanentRemove: true
            });
            return actionButtonOpts;
        }

        function _makeDisplayTargetInItems() {
            var displayTargetInItems = {},
                defaultDisplayTargetInItems = {
                    name: MAIL_LIST_ITEM_DISPLAY_TARGET.fromUser,
                    dateTime: MAIL_LIST_ITEM_DISPLAY_TARGET.createdAt,
                    boxName: false
                };
            displayTargetInItems[defaultKey] = defaultDisplayTargetInItems;
            displayTargetInItems[MAIL_STATE_NAMES.NEW_BOX] = _.assign({}, defaultDisplayTargetInItems, {
                boxName: true
            });
            displayTargetInItems[MAIL_STATE_NAMES.IMPORTANT_BOX] = displayTargetInItems[MAIL_STATE_NAMES.NEW_BOX];
            displayTargetInItems[MAIL_STATE_NAMES.ATTACHMENT_BOX] = displayTargetInItems[MAIL_STATE_NAMES.NEW_BOX];
            displayTargetInItems[MAIL_STATE_NAMES.SENT_BOX] = _.assign({}, defaultDisplayTargetInItems, {
                name: MAIL_LIST_ITEM_DISPLAY_TARGET.toFirstUser
            });
            displayTargetInItems[MAIL_STATE_NAMES.DRAFT_BOX] = _.assign({}, defaultDisplayTargetInItems, {
                name: MAIL_LIST_ITEM_DISPLAY_TARGET.toFirstUser,
                dateTime: MAIL_LIST_ITEM_DISPLAY_TARGET.updatedAt
            });
            return displayTargetInItems;
        }
    }

})();
