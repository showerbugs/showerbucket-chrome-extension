(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarWriteformBiz', CalendarWriteformBiz);

    /* @ngInject */
    function CalendarWriteformBiz($q, $state, $window, CalendarFlowTempFileBiz, WriteFormShare, CalendarFileApiBiz, PopupUtil, POPUP_STATE_NAMES, gettextCatalog, _) {
        return {
            initialize: angular.noop,
            isFormReadOnly: function () {
                return false;
            },
            isDraftState: function () {
                return false;
            },
            getWatchIntervalForTempSave: function(){
                return 1000;    //DRAFT 자동저장 시간 설정 1s
            },
            getWatchConditionForTempSave: angular.noop,
            checkWatchConditionForTempSave: function () {
                return true;
            },

            actionBeforeUnloadWithMessageWhenFormModified: function () {
                return gettextCatalog.getString('이 페이지를 나가면 마지막 저장 후 수정된 내용은 저장되지 않습니다.');
            },


            getTempFileBiz: function () {
                return CalendarFlowTempFileBiz;
            },

            createAttachedFileParams: function (/*additionalParams*/) {
                return {};
            },

            getAttachedFileBiz: function () {
                return {
                    updateFileDependency: $q.when(),
                    removeFile: $q.when()
                };
            },

            //파일 업로드 완로 후 의존성 처리를 개별로 할건지 벌크로 할건지 여부 결정 ( false)
            isUpdateDraftMultiFileDependency: function () {
                return false;
            },

            getDisplayTitle: function () {
                return WriteFormShare.mode().isUpdate ? gettextCatalog.getString('일정 편집') :
                    gettextCatalog.getString('새 일정');
            },

            getSubmitButtonText: function () {
                return gettextCatalog.getString('저장');
                //WriteFormShare.mode().isUpdate ? gettextCatalog.getString('저장') : gettextCatalog.getString('등록');
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
                return $q.when(flowObj.upload());
            },

            submitFormWithAll: function () {
                var self = this;
                var submitForm = WriteFormShare.submitForm();
                var flow = WriteFormShare.flow();

                submitForm.form().fileIdList  = _(flow.files)
                    .filter(function (file) {
                        return file.response;
                    })
                    .map(function (file) {
                        return file.response.id;
                    })
                    .value();

                return submitForm.submit().then(function (resItem) {
                    submitForm.resetFormModified();
                    return resItem;
                }).then(function (resItem) {
                    self.closeWindowOrMovePopupPage();
                    return resItem;
                });
            },

            closeWindowOrMovePopupPage: function (/*goParams, afterCallback*/) {
                var stateOptions = {location: 'replace', reload: true, inherit: false};

                if (!$window.opener) {
                    //본창에서 쓰기창 메일 전송 후  기본 쓰기폼 이동
                    var stateName = POPUP_STATE_NAMES.CALENDAR_WRITE_NEW;
                    $state.go(stateName, {}, stateOptions);
                    return;
                }

                PopupUtil.getOpenerInjectorPromise().then(function (opener$Injector) {

                    //본창이 DOORAY본창이고 angular 접근이 가능할때 본창의 SPA 기능을 활용
                    opener$Injector.invoke(['StreamModalFactory', 'CalendarScheduleAction', function (StreamModalFactory, CalendarScheduleAction) {

                        if (StreamModalFactory.isOpen()) {
                            return;
                        }

                        CalendarScheduleAction.fetchList();
                    }]);
                }).finally(function () {
                    $window.close();
                });
            }
        };
    }

})();
