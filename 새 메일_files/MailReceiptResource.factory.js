(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailReceiptResource', MailReceiptResource);

    /* @ngInject */
    function MailReceiptResource( $resource, ApiConfigUtil) {
        //return {
        //    get: function (mailId) {
        //
        //        var uniqTimeStamp = Date.now();
        //
        //        var receiptId1 = '1111' + uniqTimeStamp;
        //        var receiptId2 = '2222' + uniqTimeStamp;
        //        var receiptGroupId = '5678' + uniqTimeStamp;
        //
        //        var mock = {
        //            "header": {
        //                "isSuccessful": true,
        //                "resultCode": 0,
        //                "resultMessage": ""
        //            },
        //            "result": {
        //                "content": {
        //                    "receiptIdList": [receiptId1],
        //                    "receiptGroupIdList": [receiptGroupId]
        //                },
        //                "references": {}
        //            }
        //        };
        //
        //        mock.result.references.receiptMap = {};
        //        mock.result.references.receiptGroupMap = {};
        //        mock.result.references.receiptMap[receiptId1] = {
        //            "id": receiptId1,
        //            "rcptName": "yoda",
        //            "rcptAddress": "yoda@nhnent.com",
        //            "deliveryState": "2.0.0",
        //            "deliveryStateUpdatedAt": "2015-05-13T07:46:40+09:00",
        //            "mailState": "read", /* unread, read */
        //            "mailStateUpdatedAt": "2015-05-13T07:46:40+09:00"
        //        };
        //        mock.result.references.receiptMap[receiptId2] = {
        //            "id": receiptId2,
        //            "rcptName": "",
        //            "rcptAddress": "qpitloveqpitloveqpitlove@nhnent.com",
        //            "deliveryState": "2.0.0",
        //            "deliveryStateUpdatedAt": "2015-01-23T07:46:40+09:00",
        //            "mailState": "unread", /* unread, read */
        //            "mailStateUpdatedAt": null
        //        };
        //        mock.result.references.receiptGroupMap[receiptGroupId] = {
        //            "id": receiptGroupId,
        //            "rcptName": "group",
        //            "rcptAddress": "group@nhnent.com",
        //            "deliveryState": "2.0.0", /* 5.2.2, 5.7.1, 5.0.0 은 발송실패 */
        //            "deliveryStateUpdatedAt": "2015-05-13T07:46:40+09:00",
        //            "mailState": "read", /* unread, read */
        //            "mailStateUpdatedAt": "2015-05-13T07:46:40+09:00",
        //            "sentCount": 2,
        //            "readCount": 1,
        //            "receiptIdList": [receiptId1, receiptId2]
        //        };
        //
        //        //ResponseWrapAppendHelper.create({contents: RECEIVED_TASK_LIST, references: {}})
        //        return {$promise: $q.when(ResponseWrapAppendHelper.create(mock.result))};
        //    }
        //};

        //TODO IMPLEMENT BY BACKEND
        return $resource(ApiConfigUtil.wasContext() + '/mails/:mailId/receipt', {
            'mailId': '@mailId'
        }, {
            'get': {method: 'GET'}
        });
    }

})();
