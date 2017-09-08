(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailContentsViewModal', {
            templateUrl: 'modules/mail/view/mailContentsViewModal/mailContentsViewModal.html',
            controller: MailContentsViewModal,
            bindings: {
                $uibModalInstance: '<'
            }
        });

    /* @ngInject */
    function MailContentsViewModal($scope, $state, $document, $window,
                                    MAIL_SCREEN_MODE,
                                    BrowserTitleChangeAction,
                                    MailFolderRepository, MailResizeDividerRepository,
                                    MailDividerUtil, MailFolderUtil, StateHelperUtil, _) {
        var $ctrl = this,
            //modalWidthRatio = 0,
            NAVI_DIVIDER_SIZE = 4,
            window$ = angular.element($window),
            naviDividerType = MailResizeDividerRepository.DIVIDER_TYPES.NAVI,
            dividerType = MailResizeDividerRepository.DIVIDER_TYPES.VIEW;

        $ctrl.getViewDivider = getViewDivider;
        $ctrl.getModalLeftMargin = getModalLeftMargin;
        $ctrl.onStartResizing = onStartResizing;
        $ctrl.onEndResizing = onEndResizing;
        $ctrl.closeMailView = closeMailView;

        this.$onInit = function () {
            //modalWidthRatio = MailResizeDividerRepository.getDivider(dividerType).viewWidth / _calcMaxViewWidth();

            $document.on('mousedown', _onMousedown);
            window$.on('resize', _onResizeWindow);

            $scope.$on('modal.closing', function () {
                $state.go(StateHelperUtil.computeCurrentListStateName(), {}, {
                    inherit: true,
                    notify: false
                });
                _changeBrowserTitle();
            });
        };

        this.$onDestroy = function () {
            $document.off('mousedown', _onMousedown);
            window$.off('resize', _onResizeWindow);
        };


        $scope.$watch(StateHelperUtil.getCurrentStateName, function (newVal) {
            if (!StateHelperUtil.isViewStateByName(newVal)) {
                closeMailView();
            }
        });

        function getViewDivider() {
            return MailResizeDividerRepository.getDivider(dividerType);
        }

        function getModalLeftMargin() {
            return MailResizeDividerRepository.getDivider(naviDividerType).viewWidth + NAVI_DIVIDER_SIZE;
        }

        function onStartResizing() {
            MailResizeDividerRepository.getDivider(dividerType).screenMode = MAIL_SCREEN_MODE.NORMAL;
        }

        function onEndResizing() {
            var viewDivider = MailResizeDividerRepository.getDivider(dividerType);
            //modalWidthRatio = viewDivider.viewWidth / _calcMaxViewWidth();
            viewDivider.saveLocalStorage();
        }

        function closeMailView() {
            $ctrl.$uibModalInstance.dismiss('close mail view');
        }

        function _changeBrowserTitle() {
            var folderName = $state.params.folderId ?
                MailFolderUtil.convertDisplayUserLastFolderName(_.get(MailFolderRepository.getUserFolderById($state.params.folderId), 'name')) :
                _.get(MailFolderUtil.getSystemFolderMapByStateName(StateHelperUtil.computeCurrentListStateName()), 'displayName');
            BrowserTitleChangeAction.changeBrowserTitle(folderName);
        }

        function _onMousedown(event) {
            var target$ = angular.element(event.target);
            var isClickOnModal = !_.isEmpty(target$.parents('.modal')),
                isClickOnFullList = !_.isEmpty(target$.parents('.ui-grid-viewport')),
                isClickOnPagination = !_.isEmpty(target$.parents('.mail-pagination'));
            if (!isClickOnModal && !isClickOnFullList && !isClickOnPagination) {
                closeMailView();
            }
        }

        function _calcMaxViewWidth() {
            return window$.width() - getModalLeftMargin();
        }

        function _onResizeWindow() {
            var viewDivider = MailResizeDividerRepository.getDivider(dividerType);
            if (viewDivider.screenMode === MAIL_SCREEN_MODE.FULL) {
                viewDivider.viewWidth += 1; // watch를 호출하기 위해 실행
                return;
            }
            var width = viewDivider.viewWidth * _calcMaxViewWidth();
            viewDivider.viewWidth = MailDividerUtil.calcModalSize(viewDivider.screenMode, width);
        }
    }

})();
