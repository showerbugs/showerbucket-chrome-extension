(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailFullListGridColumnsUtil', MailFullListGridColumnsUtil);

    /* @ngInject */
    function MailFullListGridColumnsUtil(MailListItemDisplayPartUtil, gettextCatalog, _) {
        /*  default metadata in mail
         options: {
         checkbox: true,
         favorite: true,
         from: true,
         to: true,
         boxName: false,
         subject: true,
         fileCount: true,
         createdAt: true
         },
         order: ['checkbox', 'favorite', 'from', 'subject', 'fileCount', 'createdAt']
         */

        return {
            getColumnInfos: getColumnInfos
        };


        function getColumnInfos(listStateName) {
            var displayOptions = MailListItemDisplayPartUtil.getOptionsByStateName(listStateName);
            var metadata = {
                options: displayOptions,
                order: _orderFullListByOptions(displayOptions)
            };
            var gridColumnInfoMap = _getFullListColumnInfoMap();
            return _(metadata.order).map(function (key) {
                return metadata.options[key] ? key : null;
            })
                .filter()
                .concat(metadata.options.subject ? [] : ['empty'])
                .map(function (key) {
                    return gridColumnInfoMap[key];
                })
                .value();
        }


        function _orderFullListByOptions(displayOptions) {
            // pre defined display Option names
            var ALL_FULL_LIST_ORDER_LIST = [
                'checkbox', 'favorite',
                'from', 'to',
                'receiptGroup'/*보낸 메일함의 to group*/,
                'boxName'/*메일함이름*/,
                'subject', 'fileCount',
                'createdAt',
                'receiptUpdatedAt'/*보낸 메일함의 수신 날짜*/
            ];

            return _.reduce(ALL_FULL_LIST_ORDER_LIST, function (result, prop) {
                if (displayOptions[prop]) {
                    result.push(prop);
                }
                return result;
            }, []);
        }


        function _getFullListColumnInfoMap() {
            return {
                checkbox: {
                    field: 'checkbox',
                    displayName: '',
                    cellTemplate: '<mail-full-list-checkbox-item mail="::$ctrl.mail"></mail-full-list-checkbox-item>',
                    width: 35
                },
                favorite: {
                    field: 'favorite',
                    displayName: '',
                    cellTemplate: '<mail-favorite-btn mail="::$ctrl.mail"></mail-favorite-btn>',
                    width: 24
                },
                from: {
                    field: 'from',
                    displayName: gettextCatalog.getString('보낸 사람'),
                    cellTemplate: '<mail-full-list-from-item mail="::$ctrl.mail"></mail-full-list-from-item>',
                    width: '10%',
                    minWidth: 160
                },
                to: {
                    field: 'to',
                    displayName: gettextCatalog.getString('받는 사람'),
                    cellTemplate: '<mail-full-list-to-item mail="::$ctrl.mail"></mail-full-list-to-item>',
                    width: '15%',
                    minWidth: 160
                },
                receiptGroup: {  //보낸 편지함에서 수신인 그룹핑 처리 시 사용
                    field: 'receiptGroup',
                    displayName: gettextCatalog.getString('받는 사람'),
                    cellTemplate: '<mail-receipt-counts-button layout mail="::$ctrl.mail"></mail-receipt-counts-button>',
                    width: '15%',
                    minWidth: 160
                },
                boxName: {  //boxName 메일함의 표시여부로 mail-full-list-subject-item 내에서 화면 표시 여부로 사용되며 column은 빈 공백으로 둠
                    field: 'boxName',
                    displayName: '',
                    cellTemplate: 'modules/mail/contents/items/emptyItem.html',
                    width: 0
                },
                subject: {
                    field: 'subject',
                    displayName: gettextCatalog.getString('제목'),
                    cellTemplate: '<mail-full-list-subject-item layout mail="::$ctrl.mail"></mail-full-list-subject-item>',
                    width: '*',
                    minWidth: 225
                },
                fileCount: {
                    field: 'fileCount',
                    displayName: '',
                    cellTemplate: '<mail-full-list-filecount-item mail="::$ctrl.mail"></mail-full-list-filecount-item>',
                    width: 27
                },
                empty: {
                    field: 'empty',
                    displayName: '',
                    cellTemplate: 'modules/mail/contents/items/emptyItem.html',
                    width: '100%'
                },
                createdAt: {
                    field: 'createdAt',
                    displayName: gettextCatalog.getString('날짜'),
                    cellTemplate: [
                        '<mail-full-list-date-item ng-if="::$ctrl.MailReceiptItemUtil.isMailItem($ctrl.mail)" mail="::$ctrl.mail"></mail-full-list-date-item>',
                        '<mail-user-receipt-date-item ng-if="::$ctrl.MailReceiptItemUtil.isReceiptItem($ctrl.mail)" receipt="::$ctrl.mail" render-only-date-property="deliveryStateUpdatedAt"></mail-user-receipt-date-item>'
                    ].join(''),
                    width: '10%',
                    minWidth: 89
                },
                receiptUpdatedAt: {
                    field: 'receiptUpdatedAt',
                    displayName: gettextCatalog.getString('수신확인'),
                    cellTemplate: [
                        '<mail-user-receipt-date-item ng-if="::$ctrl.MailReceiptItemUtil.isReceiptItemWithoutGroup($ctrl.mail)" receipt="$ctrl.mail"></mail-user-receipt-date-item>',
                        '<mail-user-group-receipt-counts-item ng-if="::$ctrl.MailReceiptItemUtil.isReceiptItemWithGroup($ctrl.mail)" mail="::$ctrl.mail"></mail-user-group-receipt-counts-item>'
                    ].join(''),
                    width: '10%',
                    minWidth: 89
                }
            };
        }
    }


})();
