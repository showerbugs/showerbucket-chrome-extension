(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailContentsLayout', {
            templateUrl: 'modules/mail/contents/mailContentsLayout/mailContentsLayout.html',
            controller: MailContentsLayout
        });

    /* @ngInject */
    function MailContentsLayout($scope, $state,
                                API_PAGE_SIZE, MAIL_SCREEN_MODE, MAIL_STATE_NAMES,
                                ListPrevNextItemFinderUtil, MailDividerUtil, MailFolderUtil, MailListStateMetaUtil, StateHelperUtil,
                                MailFolderRepository, MailListRepository, MailListItemCheckboxRepository, MailResizeDividerRepository, MainContentsViewModeRepository, MailReceiptRepository,
                                MailSearchResultRepository,
                                BrowserTitleChangeAction, MailItemsAction, MailViewModalFactory,
                                _) {
        var $ctrl = this;

        $ctrl.PAGE_SIZE = API_PAGE_SIZE.MAIL;
        $ctrl.MailListStateMetaUtil = MailListStateMetaUtil;
        $ctrl.StateHelperUtil = StateHelperUtil;
        $ctrl.MailListRepository = MailListRepository;
        $ctrl.MailSearchResultRepository = MailSearchResultRepository;
        $ctrl.MainContentsViewModeRepository = MainContentsViewModeRepository;
        $ctrl.MailListItemCheckboxRepository = MailListItemCheckboxRepository;
        $ctrl.MailReceiptRepository = MailReceiptRepository;

        $ctrl.isSearchBox = isSearchBox;
        $ctrl.getFolderName = getFolderName;
        $ctrl.listPage = listPage;

        $ctrl.shortcutActions = {};
        $ctrl.shortcutActions['up'] = function (event) {
            if (StateHelperUtil.isViewStateByCurrentState()) {
                var prevMailId = ListPrevNextItemFinderUtil.prevItemInList(_.map(MailListRepository.getContents(), 'id'), StateHelperUtil.getCurrentStateParams().mailId);
                if (prevMailId) {
                    event.preventDefault();
                    $state.go('.', {mailId: prevMailId});
                }
            }
        };
        $ctrl.shortcutActions['down'] = function (event) {
            if (StateHelperUtil.isViewStateByCurrentState()) {
                var nextMailId = ListPrevNextItemFinderUtil.nextItemInList(_.map(MailListRepository.getContents(), 'id'), StateHelperUtil.getCurrentStateParams().mailId);
                if (nextMailId) {
                    event.preventDefault();
                    $state.go('.', {mailId: nextMailId});
                }
            }
        };
        $ctrl.shortcutActions['del'] = function () {
            var actionButtonOpts = MailListStateMetaUtil.getActionButtonOpts(StateHelperUtil.computeCurrentListStateName());
            var removeActionKeys = _.filter(['remove', 'removeDraft', 'permanentRemove'], function (key) {
                return actionButtonOpts[key] === true;
            });
            _removeActionByKey(removeActionKeys[0]);
        };

        this.$onInit = function () {
            //var dividerCache = null;
            if (!StateHelperUtil.isViewStateByCurrentState()) {
                _changeBrowserTitle();
            }

            $scope.$watch(MainContentsViewModeRepository.get, function () {
                _makeViewDivider();
                _openFullViewModalWhenFullListViewMode();
            });

            $scope.$on('$stateChangeSuccess', function (event, toState, toStateParam, fromState) {
                if (isSearchBox(toState.name) || isSearchBox(fromState.name)) {
                    // 목록뷰의 full screen mode인 경우 검색결과가 안나오는 문제가 있어서 방어코드 추가
                    _makeViewDivider();
                }
                if (!MainContentsViewModeRepository.isFullListView()) {
                    MailDividerUtil.setScreenMode($ctrl.divider, MAIL_SCREEN_MODE.NORMAL);
                }
                _openFullViewModalWhenFullListViewMode();
                if (StateHelperUtil.isViewStateByName(toState.name) ||
                    toState.name === StateHelperUtil.computeListStateNameByName(fromState.name)) {
                    return;
                }
                _changeBrowserTitle();
            });
        };

        this.$onDestroy = function () {
            MailResizeDividerRepository.removeDivider(MailResizeDividerRepository.DIVIDER_TYPES.VIEW);
        };

        function isSearchBox(name) {
            return name ? _.includes(name, MAIL_STATE_NAMES.SEARCH_BOX) : $state.includes(MAIL_STATE_NAMES.SEARCH_BOX);
        }

        function getFolderName() {
            return StateHelperUtil.getCurrentStateParams().folderId ?
                MailFolderUtil.convertDisplayUserLastFolderName(_.get(MailFolderRepository.getUserFolderById(StateHelperUtil.getCurrentStateParams().folderId), 'name')) :
                _.get(MailFolderUtil.getSystemFolderMapByStateName(StateHelperUtil.computeCurrentListStateName()), 'displayName');
        }

        function listPage(_page) {
            if (_.isUndefined(_page)) {
                return StateHelperUtil.getCurrentStateParams().page || 1;
            }
            $state.go(StateHelperUtil.getCurrentStateName(), {page: _page}, {reload: false});
            return _page;
        }

        function _openFullViewModalWhenFullListViewMode() {
            if (!isSearchBox() && StateHelperUtil.isViewStateByCurrentState() && MainContentsViewModeRepository.isFullListView()) {
                MailViewModalFactory.openFullViewModal();
            }
        }

        function _makeViewDivider() {
            $ctrl.divider = !isSearchBox() && MainContentsViewModeRepository.isFullListView() ?
                MailDividerUtil.makeModalDivider(MailResizeDividerRepository.DIVIDER_TYPES.VIEW) :
                MailDividerUtil.makeVerticalDivider(MailResizeDividerRepository.DIVIDER_TYPES.VIEW, 380);

            MailResizeDividerRepository.setDivider(MailResizeDividerRepository.DIVIDER_TYPES.VIEW, $ctrl.divider);
        }

        function _changeBrowserTitle() {
            BrowserTitleChangeAction.changeBrowserTitle(getFolderName());
        }


        function _removeActionByKey(removeActionKey) {
            var removeActionMap = {
                remove: function () {
                    MailItemsAction.moveTrashBox(MailListItemCheckboxRepository.getCheckedAllItems());
                },
                removeDraft: function () {
                    MailItemsAction.removePermanent(MailListItemCheckboxRepository.getCheckedAllItems());
                },
                permanentRemove: function () {
                    MailItemsAction.removePermanentWithConfirm(MailListItemCheckboxRepository.getCheckedAllItems());
                }
            };
            _.result(removeActionMap, removeActionKey);
        }
    }

})();
