(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TaskSubmitFormApiBiz', TaskSubmitFormApiBiz)
        .factory('TaskDraftSubmitFormApiBiz', TaskDraftSubmitFormApiBiz);
    //.factory('TaskTemplateSubmitFormBiz', TaskTemplateSubmitFormBiz);

    /* @ngInject */
    function TaskSubmitFormApiBiz(TaskResource) {
        return {
            fetch: function (projectCode, postNumber) {
                return TaskResource.get({
                    projectCode: projectCode, postNumber: postNumber, fields: ['body']
                }).$promise;
            },

            saveFromDraft: function (projectCode, draftId) {
                return TaskResource.save({projectCode: projectCode},
                    [{'draftId': draftId}]).$promise.then(function (res) {
                        return res[0] || res;
                    });
            },

            update: function (form, fromProjectCode) {
                return TaskResource.update({
                    projectCode: fromProjectCode || form.projectCode, //변경하기 전 프로젝트 코드로 API URL 경로에 명시해야함
                    postNumber: form.number
                }, form).$promise.then(function (res) {
                        return setIdAndVersion(form, res.result());
                    });
            },

            remove: function (projectCode, postNumber) {
                return TaskResource.remove({
                    projectCode: projectCode,
                    postNumber: postNumber
                }).$promise;
            }
        };
    }

    /* @ngInject */
    function TaskDraftSubmitFormApiBiz(TaskDraftResource, TaskDraftMailPartFileResource) {
        //TODO Folder id가 불필요한 DRAFT API BE 확인 필요
        return {
            fetch: function (draftId) {
                return TaskDraftResource.get({'draftId': draftId}).$promise;
            },
            submit: function (submitForm) {
                var action = submitForm.id ? 'update' : 'save'; //DRAFT PUT OR POST
                var pathParams = submitForm.id ? {'draftId': submitForm.id} : {};
                var submitDataForSubmit = submitForm.id ? submitForm : [submitForm];
                return TaskDraftResource[action](pathParams, submitDataForSubmit).$promise.then(function (res) {
                    return setIdAndVersion(submitForm, res.result());
                });
            },
            remove: function (draftId) {
                return TaskDraftResource.remove({'draftId': draftId}).$promise;
            },
            attachMailPartFiles: function (draftId, mailId) {
                //TODO REMOVE
                //var mock = {
                //    "header": {
                //        "isSuccessful": true,
                //        "resultCode": 0,
                //        "resultMessage": ""
                //    },
                //    "result": [
                //        {
                //            "id": 1,
                //            "taskId": 1,
                //            "eventId": 1,
                //            "createdAt": "2014-10-08T19:20:23+09:00",
                //            "mimeType": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                //            "name": "Hive 10월 버전 기획.pptx",
                //            "size": 10323,
                //            "createMemberId": 1,
                //            "downloadUrl": "/projects/hive/tasks/324/files/1"
                //        }
                //    ]
                //};
                //return $q.when(ResponseWrapAppendHelper.create(mock.result));

                return TaskDraftMailPartFileResource.save({draftId: draftId}, {mailId: mailId}).$promise;
            }
        };
    }

    function setIdAndVersion(submitForm, result) {
        //응답이 POST일때 배열, PUT일때 객체
        result = result[0] || result;
        submitForm.id = result.id;
        submitForm.version = result.version;
        return result;
    }

})();
