(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .factory('MailAttachmentSettingsResource', MailAttachmentSettingsResource)
        .factory('MailAttachmentSettingsRepository', MailAttachmentSettingsRepository);

    /* @ngInject */
    function MailAttachmentSettingsResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/settings/mail.attachment', {}, {
            'get': {method: 'GET'},
            'update': {method: 'PUT'}
        });
    }

    /* @ngInject */
    function MailAttachmentSettingsRepository(MailAttachmentSettingsResource) {
        var contentMap = {};
        //var MOCK_DATA = {
        //    "header": {"resultCode": 0, "resultMessage": "", "isSuccessful": true},
        //    "result": {
        //        "content": {
        //            "id": null,
        //            "category": "mail.attachment",
        //            "value": {
        //                "@type": 'mail.attachment',
        //                "name": 'mail.attachment',
        //                "enableBigfile": true, /*대용량 첨부 사용여부*/
        //                "mimeSizeLimit": Math.pow(1024, 2) * 20,   //20MB - 고정값 사용
        //                "bigfile": {
        //                    "fileSizeLimit": Math.pow(1024,2) * 500,    //500MB
        //                    "fileTotalSizePerMailLimit": Math.pow(1024,3) * 1,  //1GB
        //                    "fileCountPerMailLimit": 5,
        //                    "downloadCountLimit": 10,
        //                    "retentionPeriodDays": 14           /* 0 이면 무제한 */
        //                }
        //            }
        //        }
        //    }
        //};

        return {
            fetchAndCache: fetchAndCache,
            getContent: getContent,
            update: update
        };

        function fetchAndCache() {
            //return $q.when(ResponseWrapAppendHelper.create(MOCK_DATA.result)).then(function(res){
            //    contentMap = res.contents();
            //    return res;
            //});
            return MailAttachmentSettingsResource.get().$promise.then(function (res) {
                contentMap = res.contents();
                return res;
            });
        }

        function getContent() {
            return contentMap;
        }

        function update(param) {
            //contentMap = _.merge({}, contentMap, {value: param});
            //return $q.when(contentMap);
            return MailAttachmentSettingsResource.update(param).$promise.then(fetchAndCache);
        }
    }

})();
