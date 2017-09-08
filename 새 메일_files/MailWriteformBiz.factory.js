(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailWriteformBiz', MailWriteformBiz);

    /* @ngInject */
    function MailWriteformBiz($q, $state, $window,
                              POPUP_STATE_NAMES, MAIL_STATE_NAMES,
                              MailDraftResource, MailDraftFileResource,
                              PopupUtil,
                              MailFlowTempFileBiz,
                              WriteFormShare,
                              gettextCatalog, _) {
        function _assignFlowTarget(flowObj, id) {
            flowObj.opts.target = MailFlowTempFileBiz.makeApiUrl(id, flowObj.opts.urlPostfix);
        }

        return {
            initialize: angular.noop,

            actionBeforeUnloadWithMessageWhenFormModified: function () {
                return gettextCatalog.getString('이 페이지를 나가면 마지막 저장 후 수정된 내용은 저장되지 않습니다.');
            },

            isFormReadOnly: function () {
                return false;
            },

            isDraftState: function () {
                return $state.includes(POPUP_STATE_NAMES.MAIL_WRITE_DRAFT);
            },

            getWatchIntervalForTempSave: function () {
                return 3000;    //DRAFT 자동저장 시간 설정 3s
            },

            getWatchConditionForTempSave: function () {
                var form = WriteFormShare.submitForm().form();
                return {
                    subject: form.subject,
                    from: form.users.from,
                    to: form.users.to,
                    cc: form.users.cc,
                    mimeType: form.body.mimeType,
                    content: form.body.content,
                    fileIdList: form.fileIdList,
                    security: form.security,
                    securityEditable: form.securityEditable,
                    individualSend: form.individualSend
                };
            },

            checkWatchConditionForTempSave: function () {
                return true;
            },

            getTempFileBiz: function () {
                return MailFlowTempFileBiz.makeFlowFileBiz();
            },

            createAttachedFileParams: function (additionalParams) {
                var params = _.assign({}, WriteFormShare.submitForm().form(), additionalParams);
                return {draftId: params.id};
            },

            getAttachedFileBiz: function () {
                //메일은 draft 모드만 지원하며 draft put/delete API로 본문 및 파일 의존성을 한번에 해결한다.
                //return MailFileApiBiz.draft;
                return {
                    updateFileDependency: angular.noop, //DON'T SUPPORTED
                    updateMultiFileDependency: function (fileIdList, params) {
                        return MailDraftResource.update(params,
                            _.assign({}, WriteFormShare.submitForm().form(), {fileIdList: fileIdList}
                            )).$promise.then(function () {
                                return MailDraftFileResource.get(params).$promise.then(function (res) {
                                    WriteFormShare.submitForm().withForm({
                                        fileList: res.contents()
                                    });
                                    //메일 파일 업로드가 완료된 이후 파일 목록을 갱신하는 API가 호출되므로 flow.files 자체는 업로드 상황만을 보여주도록 하고 결과 응답 후 초기화 함
                                    WriteFormShare.flow().files.length = 0;
                                });
                            });
                    },
                    removeFile: function (idOrPartNumber, params, file) {
                        return _removeDraftFile(params.draftId, file).$promise.then(function () {
                            return MailDraftFileResource.get(params).$promise.then(function (res) {
                                WriteFormShare.submitForm().withForm({
                                    fileList: res.contents()
                                });
                            });
                        });
                    }
                };

                function _removeDraftFile(draftId, file) {
                    return file.partNumber ? MailDraftFileResource.remove({
                        draftId: draftId,
                        partNumber: file.partNumber
                    }) : MailDraftFileResource.removeBigFile({
                        draftId: draftId,
                        fileId: file.id
                    });
                }
            },

            //파일 업로드 완로 후 의존성 처리를 개별로 할건지 벌크로 할건지 여부 결정
            isUpdateDraftMultiFileDependency: function () {
                return true;
            },

            getDisplayTitle: function () {
                var submitForm = WriteFormShare.submitForm();
                var newTypeOpts = submitForm.option('newType');
                switch (newTypeOpts) {
                    case 'reply' :
                        return gettextCatalog.getString('답장');
                    case 'replyall' :
                        return gettextCatalog.getString('전체 답장');
                    case 'resend' :
                        return gettextCatalog.getString('다시 보내기');
                    case 'forward' :
                        return gettextCatalog.getString('전달');
                }
                return gettextCatalog.getString('새 메일');
            },

            getSubmitButtonText: function () {
                return gettextCatalog.getString('보내기');
            },

            _validationPromises: [],   //각 WriteFormFragments에서 외부 validation에 대한 조건을 주입할 수 있도로 관리
            addValidationPromise: function (validationPromise) {
                if (_.isFunction(validationPromise)) {
                    return this._validationPromises.push(validationPromise);
                }
            },

            validateBeforeSubmitPromise: function () {
                var invalidList = WriteFormShare.submitForm().validateForm();
                if (invalidList.length > 0) {
                    return $q.reject(invalidList);
                }

                var resultPromises = [];
                _.forEach(this._validationPromises, function (callback) {
                    resultPromises.push(callback().then(angular.noop, function (errorMaps) {
                        invalidList = invalidList.concat(_.isArray(errorMaps) ? errorMaps : [errorMaps]);
                    }));
                });

                return $q.all(resultPromises).then(function () {
                    return invalidList.length > 0 ? $q.reject(invalidList) : $q.when();
                });
            },

            uploadFilesByFlow: function (flowObj) {
                var self = this;
                var form = WriteFormShare.submitForm().form();
                if (form.id) {
                    _assignFlowTarget(flowObj, form.id);
                    return $q.when(flowObj.upload());
                }

                return WriteFormShare.submitForm().submitDraft().then(function (result) {
                    _assignFlowTarget(flowObj, result.id);
                    WriteFormShare.submitForm().resetFormModified();
                    self.moveDraftPage(result.id);
                    flowObj.upload();
                });
            },

            submitFormWithAll: function () {
                var self = this;
                var submitForm = WriteFormShare.submitForm();

                return submitForm.submit().then(function (resTask) {
                    submitForm.resetFormModified();
                    return resTask;
                }).then(function (resTask) {
                    self.closeWindowOrMovePopupPage();
                    return resTask;
                });
            },

            moveDraftPage: function (draftId) {
                //prevent page refresh and change url
                //$state.params.draftId = draftId;
                $state.go(POPUP_STATE_NAMES.MAIL_WRITE_DRAFT, {'draftId': draftId}, {
                    location: 'replace',
                    reload: false,
                    notify: false
                });
            },

            closeWindowOrMovePopupPage: function (/*goParams*/) {
                if (!$window.opener) {
                    //본창에서 쓰기창 메일 전송 후  기본 쓰기폼 이동
                    var stateName = POPUP_STATE_NAMES.MAIL_WRITE_NEW;
                    $state.go(stateName, {}, {location: 'replace', reload: true, inherit: false});
                    return;
                }

                PopupUtil.getOpenerInjectorPromise().then(function (opener$Injector) {
                    var form = WriteFormShare.submitForm().form();

                    //본창이 DOORAY본창이고 angular 접근이 가능할때 본창의 SPA 기능을 활용
                    opener$Injector.invoke(['$state', 'StreamModalFactory', function ($state, StreamModalFactory) {
                        var stateOptions = {location: 'replace', reload: true, inherit: false};

                        if (StreamModalFactory.isOpen() || !$state.includes(MAIL_STATE_NAMES.ROOT)) {
                            return;
                        }

                        //본창 드레프트상세와 삭제하려는 팝업의 드래프트가 동일할 경우 드래프트 기본 페이지로 이동
                        if ($state.includes(MAIL_STATE_NAMES.DRAFT_BOX) && _.get($state.params, 'mailId') === form.id) {
                            $state.go('^', {}, stateOptions);
                        } else {
                            //메일 정상 전송 완료 후 본창 리프레시로 간단히 목록까지 갱신 처리
                            $state.reload();
                        }
                    }]);
                }).finally(function () {
                    $window.close();
                });
            }
        };
    }

})();
