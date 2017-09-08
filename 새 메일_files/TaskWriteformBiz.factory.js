(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TaskWriteformBiz', TaskWriteformBiz);

    /* @ngInject */
    function TaskWriteformBiz($state, $q, $window, API_ERROR_CODE, ITEM_TYPE, POPUP_STATE_NAMES, SUBMIT_FORM_MODES, PROJECT_STATE_NAMES, MessageModalFactory, PostErrorHandleUtil, PostTempSaveStorage, PermissionFactory, PopupUtil, TaskQuickSearchStorage, TaskFileApiBiz, DefaultFileBiz, WriteFormShare, TagInputTaskHelper, TASK_TAG_OPTIONS, moment, gettextCatalog, _) {
        var isGoListState = false;

        function getStorageValue(storageItem, form) {
            storageItem.value.projectCode = form.projectCode;
            return storageItem.value;
        }

        function _createTmpFileIdList() {
            var option = WriteFormShare.submitForm().option(),
                flow = WriteFormShare.flow();
            return _(flow.files).map('response.id').concat(option.tmpFileIdList || []).value();
        }

        return {
            initialize: function () {
                var type = WriteFormShare.type();
                var mode = WriteFormShare.mode();
                var form = WriteFormShare.submitForm().form();
                if (type.isTask && mode.isUpdate) { //업무 수정 상태일때 기존에 임시저장된 정보를 파악함
                    var storageItem = PostTempSaveStorage.getItemUpdate(form.id);
                    if (!storageItem) {
                        return;
                    }
                    if ($state.params.forceLoadContent === 'tempsave') {
                        $q.all([TagInputTaskHelper.toDetailMemberOrGroupFromIds(storageItem.value.users.to), TagInputTaskHelper.toDetailMemberOrGroupFromIds(storageItem.value.users.cc)])
                            .then(function (result) {
                                WriteFormShare.submitForm().withForm(getStorageValue(storageItem, form)).withOption({
                                    'fromTempSave': true,
                                    'users': {
                                        to: result[0],
                                        cc: result[1]
                                    }
                                }, true);
                            });

                        //$state.params.forceLoadContent === 'tempsave' 의 값이 존재하는 경우 form의 전체상태를 readOnly로 변경함
                        this._formReadyOnly = true;
                        return;
                    }

                    if ($state.params.forceLoadContent !== 'original') {
                        //임시 저장된 데이터가 수정할 데이터보다 버전이 낮은 경우
                        if (_.get(storageItem, 'value.version', 0) < _.get(form, 'version', 0)) {
                            return MessageModalFactory.confirm(gettextCatalog.getString('{{datetime}}에 임시 저장된 내용이 최신 버전이 아닙니다.', {datetime: moment(storageItem.updatedTimestamp).format('YYYY-MM-DD HH:mm')}), '', {
                                confirmBtnLabel: gettextCatalog.getString('저장 내용 보기'),
                                confirmBtnClick: function () {
                                    PopupUtil.openTaskWritePopup('update', {
                                        projectCode: form.projectCode,
                                        postNumber: form.number,
                                        forceLoadContent: 'tempsave'
                                    });
                                },
                                cancelBtnLabel: gettextCatalog.getString('저장 내용 삭제'),
                                cancelBtnClick: function () {
                                    PostTempSaveStorage.removeItemUpdate(storageItem.value.id);
                                }
                            }).result;
                        }

                        MessageModalFactory.confirm(gettextCatalog.getString('{{datetime}}에 임시 저장된 내용이 있습니다.', {datetime: moment(storageItem.updatedTimestamp).format('YYYY-MM-DD HH:mm')}), '', {
                            confirmBtnLabel: gettextCatalog.getString('이어쓰기')
                        }).result.then(function () {
                                $q.all([TagInputTaskHelper.toDetailMemberOrGroupFromIds(storageItem.value.users.to), TagInputTaskHelper.toDetailMemberOrGroupFromIds(storageItem.value.users.cc)])
                                    .then(function (result) {
                                        WriteFormShare.submitForm().withForm(getStorageValue(storageItem, form)).withOption({
                                            'fromTempSave': true,
                                            'tmpFileIdList': storageItem.tmpFileIdList,
                                            'users': {
                                                to: result[0],
                                                cc: result[1]
                                            }
                                        }, true);
                                    });

                            });
                    }
                }
            },

            actionBeforeUnloadWithMessageWhenFormModified: function () {
                var type = WriteFormShare.type(),
                    mode = WriteFormShare.mode(),
                    form = WriteFormShare.submitForm().form();
                if (type.isTask && mode.isUpdate && !this.isFormReadOnly()) {
                    PostTempSaveStorage.saveItemUpdate(form, _createTmpFileIdList());
                }
            },

            _formReadyOnly: false,
            isFormReadOnly: function () {
                return this._formReadyOnly;
            },

            isDraftState: function () {
                return $state.includes(POPUP_STATE_NAMES.TASK_WRITE_DRAFT);
            },

            getWatchIntervalForTempSave: function () {
                return 1000;    //DRAFT 자동저장 시간 설정 1s
            },

            getWatchConditionForTempSave: function () {
                var form = WriteFormShare.submitForm().form();
                return {
                    'projectCode': form.projectCode,
                    'subject': form.subject,
                    'to': form.users.to,
                    'cc': form.users.cc,
                    'mimeType': form.body.mimeType,
                    'content': form.body.content,
                    'dueDate': form.dueDate,
                    'dueDateFlag': form.dueDateFlag,
                    'startedAt': form.startedAt,
                    'endedAt': form.endedAt,
                    'milestoneId': form.milestoneId,
                    'tagIdList': form.tagIdList,
                    'priority': form.priority
                };
            },

            checkWatchConditionForTempSave: function (newCondition, oldCondition) {
                //태그개수가 일정개수(10)가 넘으면 draft 수정 요청하지 않음
                return _.get(newCondition, 'tagIdList.length', 0) <= TASK_TAG_OPTIONS.maxLength && _.get(oldCondition, 'tagIdList.length', 0) <= TASK_TAG_OPTIONS.maxLength;
            },

            getTempFileBiz: function () {
                return DefaultFileBiz;
            },

            createAttachedFileParams: function (additionalParams) {
                var params = _.assign({}, WriteFormShare.submitForm().form(), additionalParams);
                return WriteFormShare.mode().isUpdate ? {
                    projectCode: params.projectCode,
                    postNumber: params.number
                } : {draftId: params.id};
            },

            getAttachedFileBiz: function () {
                //업무는 draft나 update만 지원
                return WriteFormShare.mode().isUpdate ? TaskFileApiBiz.task : TaskFileApiBiz.draft;
            },

            //파일 업로드 완로 후 의존성 처리를 개별로 할건지 벌크로 할건지 여부 결정 ( false)
            isUpdateDraftMultiFileDependency: function () {
                return false;
            },

            getDisplayTitle: function () {
                var type = WriteFormShare.type();
                var mode = WriteFormShare.mode();
                var form = WriteFormShare.submitForm().form();
                var titlePrefix = type.isTemplate ? gettextCatalog.getString('템플릿') : gettextCatalog.getString('업무');

                titlePrefix = this.isFormReadOnly() ? gettextCatalog.getString('읽기 전용') : titlePrefix;
                titlePrefix += '::';
                if (!mode.isDraft && form.id) {
                    var name = form.templateName || form.subject;
                    if (name) {
                        return titlePrefix + gettextCatalog.getString('편집') + ' (' + (name || '') + ')';
                    } else {
                        return titlePrefix + '#' + (form.projectCode + '/' + (form.number || ''));
                    }
                } else {
                    var defaultTitle = titlePrefix + (type.isTemplate ? gettextCatalog.getString('추가') : gettextCatalog.getString('쓰기'));
                    if (type.isTask && WriteFormShare.submitForm().isSubPost()) {
                        var parentSubject = WriteFormShare.submitForm().option('parent.subject');
                        defaultTitle = [titlePrefix + gettextCatalog.getString('새 하위 업무'), ' (', (parentSubject || ''), ')'].join('');
                    }
                    return defaultTitle;
                }
            },

            getSubmitButtonText: function () {
                return gettextCatalog.getString('저장');
            },

            _validationPromises: [],   //각 WriteFormFragments에서 외부 validation에 대한 조건을 주입할 수 있도로 관리
            addValidationPromise: function (validationPromise) {
                if (_.isFunction(validationPromise)) {
                    return this._validationPromises.push(validationPromise);
                }
            },

            validateBeforeSubmitPromise: function () {
                var submitForm = WriteFormShare.submitForm(),
                    form = submitForm.form(),
                    option = submitForm.option(),
                    invalidList = submitForm.validateForm();

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
                    if (invalidList.length > 0) {
                        return $q.reject(invalidList);
                    }

                    if (option.mode !== SUBMIT_FORM_MODES.UPDATE) {
                        return $q.when();
                    }

                    return PermissionFactory.confirmAccessTaskPromise(form.projectCode, _.get(option, 'users.from.member.organizationMemberId'), form.users.to, form.users.cc).then(function (option) {
                        isGoListState = _.get(option, 'goListState');
                    });
                });
            },

            uploadFilesByFlow: function (flowObj) {
                return $q.when(flowObj.upload());
            },

            submitFormWithAll: function (option) {

                var self = this;
                var submitForm = WriteFormShare.submitForm();
                var type = WriteFormShare.type();
                var mode = WriteFormShare.mode();
                var form = submitForm.form();
                if (type.isTemplate) {
                    return submitForm.submit().then(function (resTask) {
                        submitForm.resetFormModified();
                        return resTask;
                    }).then(function (resTask) {
                        self.closeWindowOrMovePopupPage({projectCodeFilter: form.projectCode}, function () {
                            //본창이 DOORAY본창이고 angular 접근이 가능할때 본창의 환경설정내 템플릿 목록 갱신
                            PopupUtil.resetBizCacheInOpenerWindow('TaskTemplateApiBiz');
                        });
                        return resTask;
                    });
                }

                // 수정할 때만 file upload
                var submitPromise = mode.isUpdate ? TaskFileApiBiz.task.updateMultiFileDependency(_createTmpFileIdList(), {
                    projectCode: form.projectCode,
                    postNumber: form.number
                }) : $q.when();

                submitPromise = submitPromise.then(function () {
                    return submitForm.submit().then(function (resTask) {
                        submitForm.withForm({number: resTask.number}).resetFormModified();
                        return resTask;
                    });
                });

                return submitPromise.then(function (result) {
                    var resPost = _.isFunction(result.result) ? result.result()[0] : result;
                    self._formReadyOnly = false;
                    PostTempSaveStorage.removeItemUpdate(resPost.id);
                    TaskQuickSearchStorage.setRecentTasks(_.assign({}, form, resPost));
                    if (_.get(option, 'withoutClose')) {
                        self.reloadMainPageView();
                        return resPost;
                    }

                    submitForm.resetFormModified();
                    self.closeWindowOrMovePopupPage({
                        projectCode: form.projectCode,
                        postNumber: resPost.number
                    });

                    return resPost;
                }, function (errorResponse) {
                    var errorActions = {};
                    errorActions[API_ERROR_CODE.USER_INVALID_TASK_OVERWRITE] = function () {
                        var errorMsg = ['<p>', gettextCatalog.getString('최신 버전이 아니기 때문에 저장할 수 없습니다.'), '</p>'].join('');
                        return MessageModalFactory.alert(errorMsg, '', {
                            confirmBtnLabel: gettextCatalog.getString('최신 버전 보기'),
                            confirmBtnClick: function () {
                                self._formReadyOnly = true;
                                PopupUtil.openTaskWritePopup('update', {
                                    projectCode: form.projectCode,
                                    postNumber: form.number,
                                    forceLoadContent: 'original'
                                });
                            }
                        }).result.then(function () {
                                return errorResponse;
                            });
                    };
                    errorActions[API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED] = function () {
                        var errorMsg = gettextCatalog.getString('해당 업무가 삭제되었습니다.');
                        MessageModalFactory.alert(errorMsg).result.then(function () {
                            self.closeWindowOrMovePopupPage({
                                projectCode: form.projectCode,
                                postNumber: form.number
                            });
                        });
                    };
                    errorActions[API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED] = function (projectCode, postNumber) {
                        submitForm.withOption('project.code', projectCode);
                        form.projectCode = projectCode;
                        form.number = postNumber;
                        self.submitFormWithAll(option);
                    };

                    return PostErrorHandleUtil.onPostError(errorResponse, errorActions, {showMessage: true});
                });
            },

            moveDraftPage: function (draftId) {
                //prevent page refresh and change url
                //$state.params.draftId = draftId;
                $state.go(POPUP_STATE_NAMES.TASK_WRITE_DRAFT, {'draftId': draftId}, {
                    location: 'replace',
                    reload: false,
                    notify: false
                });
            },

            reloadMainPageView: function () {
                if (!$window.opener) {
                    return;
                }

                PopupUtil.getOpenerInjectorPromise().then(function (opener$Injector) {
                    var form = WriteFormShare.submitForm().form();

                    //본창이 DOORAY본창이고 angular 접근이 가능할때 본창의 SPA 기능을 활용
                    opener$Injector.invoke(['$state', 'DetailInstanceFactory', 'ItemSyncService', function ($state, DetailInstanceFactory, ItemSyncService) {
                        if ($state.params.projectCode === form.projectCode &&
                            $state.params.postNumber === form.number) {
                            DetailInstanceFactory.getOrMakeSelectedItem(ITEM_TYPE.POST).refreshItem().then(function (task) {
                                ItemSyncService.syncItemUsingViewItem(task, ITEM_TYPE.POST);
                            });
                        }
                    }]);
                });
            },

            closeWindowOrMovePopupPage: function (goParams, afterCallback) {
                afterCallback = _.isFunction(afterCallback) ? afterCallback : angular.noop;
                if (!$window.opener) {
                    //본창에서 쓰기창 테스크를 등록 후 팝업 상세보기로, 드레프트 삭제시엔 기본 쓰기폼 이동
                    var stateName = (_.isObject(goParams) && goParams.projectCode && goParams.postNumber) ? POPUP_STATE_NAMES.TASK_VIEW :
                        $state.includes(POPUP_STATE_NAMES.TASK_TEMPLATE) ? POPUP_STATE_NAMES.TASK_TEMPLATE_WRITE : POPUP_STATE_NAMES.TASK_WRITE_NEW;
                    $state.go(stateName, goParams || {}, {location: 'replace', reload: true, inherit: false});
                    afterCallback();
                    return;
                }

                //만약 임시보관함에서 테스크 등록/삭제가 발생되면 draftId를 제외한 기본 임시보관함 목록으로 이동
                PopupUtil.getOpenerInjectorPromise().then(function (opener$Injector) {
                    var form = WriteFormShare.submitForm().form();

                    //본창이 DOORAY본창이고 angular 접근이 가능할때 본창의 SPA 기능을 활용
                    opener$Injector.invoke(['$state', 'DetailInstanceFactory', 'ItemSyncService', 'StreamModalFactory', function ($state, DetailInstanceFactory, ItemSyncService, StreamModalFactory) {
                        var stateOptions = {location: 'replace', reload: true},
                            stateParams = goParams || {},
                            stateName = stateParams.postNumber && (!$state.includes('**.view') && !$state.includes(POPUP_STATE_NAMES.ROOT)) ? '.view' : '.';

                        //본문 편집일 시에는 읽기 상세영역과 목록에서 해당 업무만 갱신하게 합니다.
                        if (StreamModalFactory.isOpen() ||
                            $state.includes(PROJECT_STATE_NAMES.PROJECT_STATE) &&
                            stateParams.postNumber &&
                            $state.params.projectCode === stateParams.projectCode &&
                            ($state.params.postNumber === stateParams.postNumber ||
                            _.get(form, 'parent.number'))) {
                            var selectedItem = StreamModalFactory.isOpen() ? DetailInstanceFactory.getOrMakeStreamItem(ITEM_TYPE.POST) :
                                DetailInstanceFactory.getOrMakeSelectedItem(ITEM_TYPE.POST);
                            if (selectedItem.param.projectCode) {
                                selectedItem.refreshItem().then(function (task) {
                                    ItemSyncService.syncItemUsingViewItem(task, ITEM_TYPE.POST);
                                });
                            }
                            return;
                        }

                        //goListState option이 있고 변경한 업무가 현재 업무와 같으면 리스트 페이지로 이동
                        if (isGoListState) {
                            isGoListState = false;
                            stateParams = {};

                            if (_.get($state.params, 'postNumber') === form.number) {
                                stateName = '^';
                            }
                        }

                        //본창 드레프트상세와 삭제하려는 팝업의 드래프트가 동일할 경우 드래프트 기본 페이지로 이동
                        if ($state.includes(PROJECT_STATE_NAMES.DRAFT_BOX_VIEW) && _.get($state.params, 'draftId') === form.id) {
                            stateName = PROJECT_STATE_NAMES.DRAFT_BOX;
                            stateParams = {};
                        }

                        if ($state.includes(PROJECT_STATE_NAMES.COMMENT_BOX_VIEW)) {
                            stateParams.commentId = null;
                        }

                        //본창이 업무팝업 등록/드래프트/수정 일경우 state refresh 무시함
                        if (!$state.includes(POPUP_STATE_NAMES.TASK_WRITE) && $state.includes(PROJECT_STATE_NAMES.PROJECT_STATE)) {
                            $state.go(stateName, stateParams, stateOptions);
                        }

                        afterCallback();
                    }]);
                }).finally(function () {
                    $window.close();
                });

            }

        };
    }

})();
