(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailFullListGrid', {
            templateUrl: 'modules/mail/contents/mailFullListGrid/mailFullListGrid.html',
            controller: MailFullListGrid,
            bindings: {
                mailList: '<',
                selectedReceiptList: '<',
                isLoading: '<',
                naviWidth: '<'
            }
        });

    /* @ngInject */
    function MailFullListGrid($scope, $templateCache,
                               API_PAGE_SIZE, EMIT_EVENTS,
                               MailReceiptRepository,
                               StateHelperUtil, MailReceiptItemUtil, MailFullListGridColumnsUtil,
                               _) {
        var $ctrl = this,
            templatePathPrefix = 'modules/mail/contents/mailFullListGrid/',
            _debounceUpdateUiVersion = _.debounce(_updateUiVersion, 50);

        //Default template overriding...
        $templateCache.put('ui-grid/ui-grid-header', $templateCache.get(templatePathPrefix + 'fullListGridHeader.html'));
        $templateCache.put('ui-grid/uiGridHeaderCell', $templateCache.get(templatePathPrefix + 'fullListGridHeaderCell.html'));
        $templateCache.put('ui-grid/ui-grid', $templateCache.get(templatePathPrefix + 'fullListGridUiGrid.html'));
        $templateCache.put('ui-grid/uiGridViewport', $templateCache.get(templatePathPrefix + 'fullListGridViewport.html'));

        $ctrl.StateHelperUtil = StateHelperUtil;

        $ctrl.displayMailList = [];

        $ctrl.options = {
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
            },
            enableSorting: false,
            enableColumnMenus: false,
            showGridFooter: false,
            showColumnFooter: false,
            showHeader: true,
            minRowsToShow: API_PAGE_SIZE.MAIL,
            virtualizationThreshold: 1000,  //Grid Max row visible Count
            enableHorizontalScrollbar: 0,//ref. ui-grid.js uiGridConstants.scrollbars.NEVER,
            enableVerticalScrollbar: 0,//ref. ui-grid.js uiGridConstants.scrollbars.NEVER,
            rowTemplate: templatePathPrefix + 'fullListRowTpl.html',
            columnDefs: MailFullListGridColumnsUtil.getColumnInfos(),
            data: '$ctrl.displayMailList'
        };

        this.$onInit = function () {
            $ctrl.uiVersion = 1;
        };

        this.$onChanges = function (changes) {
            if (changes.isLoading && !$ctrl.isLoading) {
                $ctrl.options.columnDefs = MailFullListGridColumnsUtil.getColumnInfos(StateHelperUtil.computeCurrentListStateName());
                _debounceUpdateUiVersion();
            }

            if (_isUpdatedChangesValue(changes.mailList) || _isUpdatedChangesValue(changes.selectedReceiptList)) {
                _refreshDisplayMailList();
            }

            if (changes.naviWidth) {
                _debounceUpdateUiVersion();
            }
        };

        function _isUpdatedChangesValue(changesValue) {
            return changesValue && !_.isEqual(_.get(changesValue, 'currentValue'), _.get(changesValue, 'previousValue'));
        }

        function _updateUiVersion() {
            $ctrl.uiVersion += 1;
        }

        ///보낸 메일함에서 To가 여러 명일때 기존 메일을 각 멤버별로 보여질 수 있도록 복사본에 각 users.to 정보를 개별로 설정하여 처리함
        function _refreshDisplayMailList() {
            //console.log('MailFullListGrid _refreshDisplayMailList');
            $ctrl.displayMailList = _.assign([], $ctrl.mailList);

            //보낸 메일함의 여러명인 to에 대한 정보 처리 표시
            _.forEach(MailReceiptRepository.getContentsMap(), function (receiptResult, mailId) {
                $ctrl.displayMailList = MailReceiptItemUtil.injectReceiptInfoToMailList($ctrl.displayMailList, receiptResult, mailId);
                $scope.$emit(EMIT_EVENTS.CUSTOM_DOM_RENDERED);
            });
        }
    }

})();
