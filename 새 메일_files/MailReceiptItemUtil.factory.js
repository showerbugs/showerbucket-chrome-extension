(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailReceiptItemUtil', MailReceiptItemUtil);

    /* @ngInject */
    function MailReceiptItemUtil(ResponseWrapAppendHelper, _) {
        return {
            injectReceiptInfoToMailList: injectReceiptInfoToMailList,
            isMailItem: isMailItem,
            isReceiptItem: isReceiptItem,
            isReceiptItemWithoutGroup: isReceiptItemWithoutGroup,
            isReceiptItemWithGroup: isReceiptItemWithGroup,
            hasReceiptCountsInMail: hasReceiptCountsInMail
        };

        function injectReceiptInfoToMailList(displayMailList, relatedReceiptResult, referenceMailId) {
            var results = _.assign([], displayMailList);
            var content = relatedReceiptResult.content;
            var index = _.findIndex(results, {id: referenceMailId});

            //일반 메일수신 확인용 데이터 목록 ( 목록뷰에서 subject 표시를 위해 원본 mail.subject를 injection)
            //ex) ResponseWrapAppendHelper.create({contents: RECEIVED_TASK_LIST, references: {}}).contents();
            var receiptList = _.map(content.receiptIdList, function (id) {
                return ResponseWrapAppendHelper.create({
                    contents: _.assign({subject: results[index].subject}, relatedReceiptResult.content._wrap.refMap.receiptMap(id)),
                    references: relatedReceiptResult.references
                }).contents();
            });
            //DL 메일수신 확인용 데이터 목록
            var receiptGroupList = _.map(content.receiptGroupIdList, function (groupId) {
                return ResponseWrapAppendHelper.create({
                    contents: _.assign({subject: results[index].subject}, relatedReceiptResult.content._wrap.refMap.receiptGroupMap(groupId)),
                    references: relatedReceiptResult.references
                }).contents();
            });

            Array.prototype.splice.apply(results, [index + 1, 0].concat(receiptList.concat(receiptGroupList)));
            return results;
        }

        //메일 데이터 타입 (메일 목록과 메일 상세가 공통으로 가지고 있어야 함)
        function isMailItem(mail) {
            return mail.annotations && !isReceiptItem(mail);
        }

        //수신확인 데이터 타입 ( 일반 메일 OR DL )
        function isReceiptItem(mail) {
            return mail.mailState && mail.deliveryState;
        }

        //수신확인 데이터  타입 ( 일반 메일용 )
        function isReceiptItemWithoutGroup(mail) {
            return isReceiptItem(mail) && _.isUndefined(mail.receiptIdList);
        }

        //수신확인 데이터  타입 ( DL )
        function isReceiptItemWithGroup(mail) {
            return isReceiptItem(mail) && _.isArray(mail.receiptIdList);
        }

        //메일 정보 중에서 수신확인 정보를 알수 있는 지 여부 (mail client에서는 직접 smtp로 메일을 발송하므로 수신확인을 알 수 없음
        function hasReceiptCountsInMail(mail) {
            return isMailItem(mail) && _.get(mail, 'mailSummary.receipts.sentCount', 0) > 0;
        }
    }

})();
