(function () {

    'use strict';

    angular
        .module('doorayWebApp.layout')
        .factory('WriteFormShare', WriteFormShare)
        .controller('WriteformCommonCtrl', WriteformCommonCtrl)
        .controller('WriteformLayoutCtrl', WriteformLayoutCtrl)
        .controller('WriteformLayoutHeadCtrl', WriteformLayoutHeadCtrl)
        .controller('WriteformLayoutBodyCtrl', WriteformLayoutBodyCtrl);

    /* @ngInject */
    function WriteFormShare(SUBMIT_FORM_MODES, TASK_SUBMIT_FORM_TYPES, MAIL_SUBMIT_FORM_TYPES, CALENDAR_SUBMIT_FORM_TYPES, _) {
        // isNew 에서 isDraft로 변경될 때 변경사항이 같이 반영되야하여 새로 객체를 안만들게 수정했습니다.
        var mode = {},
            type = {};
        return {
            biz: function (biz) {
                this._biz = _.isUndefined(biz) ? this._biz : biz;
                return this._biz;
            },
            submitForm: function (submitForm) {
                this._submitForm = _.isUndefined(submitForm) ? this._submitForm : submitForm;
                return this._submitForm;
            },
            editor: function (editor) {
                this._editor = _.isUndefined(editor) ? this._editor : editor;
                return this._editor;
            },
            flow: function (flow) {
                this._flow = _.isUndefined(flow) ? this._flow : flow;
                return this._flow;
            },
            type: function () {
                type.isMail = this.submitForm().option('type') === MAIL_SUBMIT_FORM_TYPES.MAIL;
                type.isTask = this.submitForm().option('type') === TASK_SUBMIT_FORM_TYPES.TASK;
                type.isCalendar = this.submitForm().option('type') === CALENDAR_SUBMIT_FORM_TYPES.CALENDAR;
                type.isTemplate = this.submitForm().option('type') === TASK_SUBMIT_FORM_TYPES.TEMPLATE;
                return type;
            },
            mode: function () {
                mode.isNew = this.submitForm().option('mode') === SUBMIT_FORM_MODES.NEW;
                mode.isDraft = this.submitForm().option('mode') === SUBMIT_FORM_MODES.DRAFT;
                mode.isUpdate = this.submitForm().option('mode') === SUBMIT_FORM_MODES.UPDATE;
                return mode;
            }
        };
    }

    /* @ngInject */
    function WriteformCommonCtrl($scope, $window, submitForm, WriteFormShare, writeFormBiz) {
        WriteFormShare.biz(writeFormBiz);
        WriteFormShare.submitForm(submitForm);
        //FIXME https://nhnent.dooray.com/project/projects/dooray-메일/68 파일 업로드 전에 메일을 호출하기 위한 예외추가
        WriteFormShare.flow(writeFormBiz.getTempFileBiz().createFlow());

        //WriteFormShare.flow(writeFormBiz.getTempFileBiz(submitForm, function () {
        //    return $scope.draftAction.submitDraft();
        //}).createFlow());

        writeFormBiz.initialize();

        var window$ = angular.element($window);

        //WriteForm Global
        $scope.form = WriteFormShare.submitForm().form();
        $scope.option = WriteFormShare.submitForm().option();
        $scope.mode = WriteFormShare.mode();
        $scope.type = WriteFormShare.type();
        $scope.flow = WriteFormShare.flow();
        $scope.ui = {
            loading: true,
            options: {
                modelOptions: {updateOn: 'default blur submit', debounce: {default: 500, blur: 0, submit: 0}}
            }
        };

        window$.on('beforeunload', onBeforeUnload);

        $scope.$on('$destroy', function () {
            window$.off('beforeunload', onBeforeUnload);
        });

        function onBeforeUnload() {
            if (submitForm.isFormModified()) {
                return writeFormBiz.actionBeforeUnloadWithMessageWhenFormModified();
            }
        }
    }

    /* @ngInject */
    function WriteformLayoutCtrl($q, fragments, submitForm, writeFormBiz, $controller, $document, $scope, $window,
                                 KEYMAP,
                                 MessageModalFactory,
                                 DateConvertUtil, HelperPromiseUtil,
                                 WriteFormShare, gettextCatalog, _) {
        this.fragments = fragments;
        $controller('WriteformCommonCtrl', {
            $scope: $scope,
            submitForm: submitForm,
            writeFormBiz: writeFormBiz
        });

        var submitPromise;
        var writeformBiz = WriteFormShare.biz();

        $scope.isFormReadOnly = function () {
            return writeformBiz.isFormReadOnly();
        };

        $scope.isDraftState = function () {
            return writeformBiz.isDraftState();
        };

        $scope.ui.saveInfo = null;
        $scope.draftAction = {
            _watchhandler: null,
            _removeConfirmMsg: '',
            _debounceWatchTempSave: _.debounce(function (newVal, oldVal) {
                if (!_.isEqual(newVal, oldVal) && !HelperPromiseUtil.isResourcePending(submitPromise) &&
                    writeformBiz.checkWatchConditionForTempSave(newVal, oldVal)) {
                    $scope.draftAction.submitDraft();
                }
            }, writeformBiz.getWatchIntervalForTempSave()),
            setRemoveConfirmMsg: function (msg) {
                this._removeConfirmMsg = msg;
            },
            submitDraft: function () {
                $scope.ui.saveInfo = gettextCatalog.getString('업로드 중');
                if (HelperPromiseUtil.isResourcePending(submitPromise)) {
                    return submitPromise;
                }

                submitPromise = submitForm.submitDraft().then(function (result) {
                    $scope.ui.saveInfo = gettextCatalog.getString('{{datetime}}에 저장됨', {datetime: DateConvertUtil.parseDateTimeObjectFromNow({time: 'HH:mm'}).time});
                    submitForm.resetFormModified();
                    writeformBiz.moveDraftPage(result.id);
                    return result;
                }).catch(function () {
                    $scope.ui.saveInfo = gettextCatalog.getString('업로드 오류');
                    return $q.reject();
                });
                return submitPromise;
            },

            removeDraft: function () {
                return MessageModalFactory.confirm(this._removeConfirmMsg, '', gettextCatalog.getString('삭제.1')).result.then(function () {
                    return submitForm.removeDraft().then(function () {
                        submitForm.isFormModified = angular.noop;
                        writeformBiz.closeWindowOrMovePopupPage();
                    });
                });
            },

            watchForAutoSave: function () {
                var self = this;
                this.unwatchForAutoSave();
                // TODO watch true 제거
                this._watchhandler = $scope.$watch(function () {
                    return writeformBiz.getWatchConditionForTempSave();
                }, self._debounceWatchTempSave, true);
            },

            unwatchForAutoSave: function () {
                if (this._watchhandler) {
                    this._watchhandler();
                    this._watchhandler = null;
                }
                this._debounceWatchTempSave.cancel();
            }
        };

        $scope.$watch(function () {
            return writeformBiz.getDisplayTitle();
        }, function (newVal) {
            $document[0].title = newVal;
        });

        function validateBeforeSubmit() {
            $scope.invalidControlName = null;

            return writeformBiz.validateBeforeSubmitPromise().then(function () {
                //파일 업로드 중이면 등록/수정 중단
                if ($scope.flow.isUploading()) {
                    MessageModalFactory.alert(gettextCatalog.getString('파일 업로드 완료 후 진행이 가능합니다.'));
                    return $q.reject();
                }

                //dooray-datepicker에서 minDate의 값이 UI 표시하는 제한과 충돌되어 writeForm.$invalid 조건이 발생될수 있으므로 주석 처리
                if (HelperPromiseUtil.isResourcePending(submitPromise) /*|| $scope.writeForm.$invalid*/) {
                    return $q.reject();
                }

                return $q.when();
            }, function (invalidList) {
                if (!_.isEmpty(invalidList) && !_.isObject(invalidList[0])) {
                    return $q.reject();
                }

                var message = invalidList[0].msg;
                if (message) {
                    MessageModalFactory.alert(message).result.then(function () {
                        $scope.invalidControlName = invalidList[0].key;
                    });
                }
                return $q.reject();
            });
        }

        var plainModalInstance;
        $scope.submit = function (withoutClose) {
            validateBeforeSubmit().then(function () {
                //TODO : 단축키로 등록 및 수정할 경우 DOM 이벤트 발생이 되지 않아서 이를 위한 예외처리 추가
                plainModalInstance = MessageModalFactory.plain(gettextCatalog.getString('<strong>업로드 중 <img src="/assets/images/ajax-loader.gif" style="width:5%;"></strong>'));
                $scope.draftAction.unwatchForAutoSave();
                $scope.ui.saveInfo = withoutClose ? gettextCatalog.getString('저장 중') : '';
                submitPromise = writeformBiz.submitFormWithAll({withoutClose: withoutClose}).then(function () {
                    $scope.ui.saveInfo = withoutClose ? gettextCatalog.getString('{{datetime}}에 저장됨', {datetime: DateConvertUtil.parseDateTimeObjectFromNow({time: 'HH:mm'}).time}) : '';
                }, function () {
                    $scope.ui.saveInfo = withoutClose ? gettextCatalog.getString('저장 오류') : '';
                }).finally(function () {
                    plainModalInstance.close();
                    plainModalInstance = null;
                });
            });
        };

        $scope.cancel = function () {
            $window.close();
        };

        $scope.shortcut = {};
        $scope.shortcut[KEYMAP.SUBMIT] = function () {
            if (!writeformBiz.isFormReadOnly()) {
                $scope.submit();
            }
        };

        //TODO 메일에서는 전달 업무등록 재전송 일 경우 본문 마임에 포함된 파일 목록 삭제를 위해 무조건 임시저장으로 처리 (new, draft, reply, replyall은 제외)
        if (WriteFormShare.submitForm().option('forceDraft')) {
            $scope.draftAction.submitDraft();
        }
    }


    /* @ngInject */
    function WriteformLayoutHeadCtrl() {
    }

    /* @ngInject */
    function WriteformLayoutBodyCtrl($element, $scope, $timeout, HelperPromiseUtil, MessageModalFactory, WriteFormShare, deviceDetector, gettextCatalog, _) {
        var writeformBiz = WriteFormShare.biz();
        $scope.submitButtonText = writeformBiz.getSubmitButtonText();

        //업로드중이거나 대기중인 파일 취소시킴 (드레프트 혹은 수정중인 쓰기창을 닫거나 드레프트 삭제 시)
        var cancelUploadFiles = function () {
            $timeout(function () {  //avoid to $digest
                $scope.flow && $scope.flow.cancel();
            }, 0, false);
        };

        $scope.$on('$destroy', function () {
            cancelUploadFiles();
        });

        //1개 혹은 여러개 파일 업로드 응답 후 flow.file 객체에 해당 응답을 캐시함
        var draftSavePromiseForFileDependency;
        $scope.flow.on('fileSuccess', function ($file, responseText) {
            var response = angular.fromJson(responseText);

            if (!response.header.isSuccessful) {
                writeformBiz.getTempFileBiz().removeTmpFileWithOutConfirm($file);
                MessageModalFactory.alert(response.header.resultMessage || gettextCatalog.getString('파일 업로드에 실패했습니다.'));
                return;
            }

            //파일 의존성 설정 여부에 대한 처리를 개별 혹은 건별로 할때 모두 필요한 처리임
            $file.response = response.result[0];
        });

        $scope.flow.on('filesSubmitted', function () {
            return writeformBiz.uploadFilesByFlow($scope.flow);
        });

        //$scope.flow.on('catchAll', function () {
        //    console.log('flow catchAll', arguments, $scope.flow.files);
        //});

        //1개 파일 업로드 응답 후 곧바로 dependency 추가함 (EX: POST)
        if (!writeformBiz.isUpdateDraftMultiFileDependency()) {
            $scope.flow.on('fileSuccess', function ($file) {
                var fileId = $file.response.id;
                if (($scope.mode.isNew || $scope.mode.isDraft) && !$scope.type.isCalendar) {
                    if ($scope.form.id) {
                        _updateDraftFileDependency($scope.form.id, fileId);
                    } else {
                        draftSavePromiseForFileDependency = draftSavePromiseForFileDependency || $scope.draftAction.submitDraft();
                        draftSavePromiseForFileDependency.then(function (result) {
                            _updateDraftFileDependency(result.id, fileId);
                        });
                    }
                }
            });
        }

        //파일 여러개가 업로드가 모두 완료 후 dependency 일괄 추가함 (EX: MAIL)
        if (writeformBiz.isUpdateDraftMultiFileDependency()) {
            $scope.flow.on('complete', function () {
                var fileIdList = _.map($scope.flow.files, 'response.id');
                if (($scope.mode.isNew || $scope.mode.isDraft) && !$scope.type.isCalendar) {
                    if ($scope.form.id) {
                        _updateDraftMultiFileDependency($scope.form.id, fileIdList);
                    } else {
                        draftSavePromiseForFileDependency = draftSavePromiseForFileDependency || $scope.draftAction.submitDraft();
                        draftSavePromiseForFileDependency.then(function (result) {
                            _updateDraftMultiFileDependency(result.id, fileIdList);
                        });
                    }
                }
            });
        }

        function _updateDraftFileDependency(draftId, fileId) {
            return writeformBiz.getAttachedFileBiz().updateFileDependency(fileId, writeformBiz.createAttachedFileParams({id: draftId}));
        }

        function _updateDraftMultiFileDependency(draftId, fileIdList) {
            return writeformBiz.getAttachedFileBiz().updateMultiFileDependency(fileIdList, writeformBiz.createAttachedFileParams({id: draftId}));
        }

        //FIXME 메일에서는 자체 파일 전송하기 위한 조건 유효검증이 포함되어 있음
        if ($scope.type.isTask || $scope.type.isCalendar) {
            var MAX_UPLOAD_ONCE = 100;
            $scope.flow.on('filesAdded', function (addedFiles) {
                var uploadFileCount = $scope.flow.files.length;    //기존 flow로 등록된 파일 수
                if ($scope.mode.isNew || $scope.mode.isDraft) {   //draft이면 form.fileIdList 개수 포함 없으면 null 예외처리
                    uploadFileCount += $scope.form.fileIdList ? $scope.form.fileIdList.length : 0;
                }
                if (uploadFileCount + addedFiles.length > MAX_UPLOAD_ONCE) {
                    MessageModalFactory.alert(gettextCatalog.getString('파일 첨부는 1회, 최대 {{::maxuploadonce}}개까지 가능합니다.', {maxuploadonce: MAX_UPLOAD_ONCE}));
                    if (uploadFileCount >= MAX_UPLOAD_ONCE) {
                        return false;
                    }
                    addedFiles.length = MAX_UPLOAD_ONCE - uploadFileCount;
                }

                $timeout(function () {
                    var elLastItem = $element.find('.upload-files-wrapper li:last')[0];
                    if (elLastItem) {
                        elLastItem.scrollIntoView();
                    }
                }, 0, false);
            });
        }

        //writeformAttachedFileList.html내부에서 참조하며 스팩에 맞게 재 구현함
        $scope.fileservice = {
            _promise: {
                removeTmpFile: null,
                removeAttachedFile: null
            },

            //선택한 업로드중인 파일을 취소시킴
            cancelUploadFile: function ($file) {
                $timeout(function () {    //avoid to $digest scope.$$pahse
                    $file.cancel();
                }, 0, false);
            },

            isPendingRemoveTmpFile: function () {
                return HelperPromiseUtil.isResourcePending(this._promise.removeTmpFile);
            },

            removeTmpFile: function ($file) {
                if (this.isPendingRemoveTmpFile()) {
                    return;
                }

                //if has task.id update otherwise new and files update ===> Delete File
                this._promise.removeTmpFile = writeformBiz.getTempFileBiz().removeTmpFile($file);
            },

            isPendingAttachedFile: function () {
                return HelperPromiseUtil.isResourcePending(this._promise.removeAttachedFile);
            },

            removeAttachedFile: function (fileId, file) {
                if (this.isPendingAttachedFile()) {
                    return;
                }
                MessageModalFactory.confirm(gettextCatalog.getString('해당 파일을 삭제하시겠습니까?')).result.then(_.bind(function () {
                    this._promise.removeAttachedFile = writeformBiz.getAttachedFileBiz().removeFile(fileId, writeformBiz.createAttachedFileParams(), file).then(function (res) {
                        _.remove($scope.form.fileIdList, function (_fileId) {
                            return _fileId === fileId;
                        });
                        //from mail to task
                        _.remove($scope.form.fileList, function (_file) {
                            return _file.id === fileId;
                        });
                        _.remove($scope.flow.files, function (_flowFile) {
                            return _.get(_flowFile, 'response.id') === fileId;
                        });
                        return res;
                    });
                }, this));
            }
        };

        //TODO: safari의 flex height 버그가 해결 될 때 까지 임시코드
        if (deviceDetector.isDesktop() && deviceDetector.browser === 'safari') {
            $scope.$watch(function () {
                return $element.find('.te-editor-section').height();
            }, function (newVal) {
                $element.find('.tui-editor').height(newVal);
            });

            $scope.$watch(function () {
                return $element.find('.mce-container-body').height();
            }, function (newVal) {
                $element.find('.mce-edit-area').height(newVal - 71);
            });
        }
    }


})();
