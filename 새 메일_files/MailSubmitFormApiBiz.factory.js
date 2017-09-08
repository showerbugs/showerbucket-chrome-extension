(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailSubmitFormApiBiz', MailSubmitFormApiBiz)
        .factory('MailDraftSubmitFormApiBiz', MailDraftSubmitFormApiBiz);

    /* @ngInject */
    function MailSubmitFormApiBiz(MailResource) {
        return {
            fetch: function (mailId) { //interpolation = true 메일을 전달/답장/전체답장/업무 등록 시 마임에 첨부된 이미지를 인라인으로 변경해야함
                var params = {mailId: mailId, interpolation: true};
                return MailResource.get(params).$promise;
            },
            saveFromDraft: function (draftId) {
                return MailResource.save({},
                    {'draftId': draftId}).$promise.then(function (result) {
                        return result[0] || result;
                    });
            }
        };
    }

    /* @ngInject */
    function MailDraftSubmitFormApiBiz(MailDraftResource, MailDraftMailPartFileResource) {
        //TODO Folder id가 불필요한 DRAFT API BE 확인 필요
        return {
            fetch: function (draftId) {
                return MailDraftResource.get({'draftId': draftId}).$promise;
            },
            submit: function (submitForm) {
                function setIdAndVersion(result) {
                    result = result[0] || result;
                    submitForm.id = result.id;
                    submitForm.version = result.version;
                    return result;
                }

                var action = submitForm.id ? 'update' : 'save'; //DRAFT PUT OR POST
                var pathParams = submitForm.id ? {'draftId': submitForm.id} : {};

                var submitDataForSubmit = submitForm.id ? submitForm : [submitForm];
                return MailDraftResource[action](pathParams, submitDataForSubmit).$promise.then(function (res) {
                    return setIdAndVersion(res.result());
                });
            },
            remove: function (draftId) {
                return MailDraftResource.delete({'draftId': draftId}).$promise;
            },
            attachMailPartFiles: function (draftId, mailId) {
                ////TODO REMOVE
                //var mock = {
                //    "header": {
                //        "isSuccessful": true,
                //        "resultCode": 0,
                //        "resultMessage": ""
                //    },
                //    "result": [{
                //        "createdAt": "2015-05-13T07:46:40+09:00",
                //        "mimeType": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                //        "name": "Hive 10월 버전 기획.pptx",
                //        "size": "10323",
                //        "downloadUrl": "/mails/2/parts/1?type=raw", /* download url 이 메일의 특정 파트를 가르킴 */
                //        "partNumber": 1
                //    }]
                //};
                //return $q.when(ResponseWrapAppendHelper.create(mock.result));

                return MailDraftMailPartFileResource.save({draftId: draftId}, {mailId: mailId}).$promise;
            }
        };
    }

})();
