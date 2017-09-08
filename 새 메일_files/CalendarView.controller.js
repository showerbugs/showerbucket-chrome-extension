(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .controller('CalendarViewCtrl', CalendarViewCtrl)
        .controller('CalendarViewBodyCtrl', CalendarViewBodyCtrl);


    /* @ngInject */
    function CalendarViewCtrl($scope, $state, ITEM_TYPE, CalendarDataConverterUtil, CalendarUpdateRecurrenceTypeModal, HelperConfigUtil, HelperPromiseUtil, ItemSyncService, PopupUtil, CalendarScheduleAction, MessageModalFactory, StreamItemList, StreamModalFactory, CalendarPermissionUtil, gettextCatalog, _) {
        var statusMsgMap = {
            accepted: gettextCatalog.getString('일정을 수락했습니다.'),
            tentative: gettextCatalog.getString('일정을 미정으로 지정합니다.'),
            declined: gettextCatalog.getString('일정을 거절했습니다.')
        }, setStatusPromise = null;

        function init() {
            $scope.myMemberId = HelperConfigUtil.orgMemberId();
            $scope.ui = {
                visible: {
                    scheduleStatus: true,
                    comments: true,
                    remove: false,
                    edit: true,
                    newSubPost: true
                },
                disable: {
                    scheduleStatus: false
                }
            };
            $scope.statusMsg = '';
        }

        init();

        if ($state.includes('main.popup') && _.isUndefined($scope.isChatMode)) {
            $scope.isChatMode = true;
        }

        $scope.$watch('selectedItem.data', function (newVal) {

            if (!_.isEmpty(newVal)) {
                $scope.ui.visible.scheduleStatus = $scope.selectedItem.data._getOrSetProp('scheduleStatus');
                $scope.ui.visible.recurrence = $scope.selectedItem.data.recurrenceId && $scope.selectedItem.data.recurrenceType === 'unmodified';
                $scope.ui.visible.edit = CalendarPermissionUtil.canEditSchedule($scope.selectedItem.data._wrap.refMap.calendarMap($scope.selectedItem.data.calendarId), $scope.selectedItem.data);
                $scope.ui.visible.remove = CalendarPermissionUtil.canDeleteSchedule($scope.selectedItem.data._wrap.refMap.calendarMap($scope.selectedItem.data.calendarId));
                $scope.calendar = CalendarDataConverterUtil.setCalendarProp($scope.selectedItem.data._wrap.refMap.calendarMap($scope.selectedItem.data.calendarId), $scope.selectedItem.data._wrap.refMap.organizationMemberMap);
            }
        });

        $scope.$on('$destroy', function () {
            $scope.selectedItem = null;
        });

        //테스크의 전체나 부분적 비동기 로딩이 모두 완료 되었을때 기존 스크롤의 위치를 임시 저장 및 수동 복원
        $scope.checkLoadingComplete = function (target) {
            return !_.some([target.status.loading, target.status.subPostLoading, target.status.fileLoading]);
        };

        $scope.changeStatus = function (status) {
            if (HelperPromiseUtil.isResourcePending(setStatusPromise) || status === $scope.selectedItem.data._getOrSetProp('scheduleStatus')) {
                return;
            }

            ItemSyncService.syncItemUsingCallback($scope.selectedItem.data.id, ITEM_TYPE.SCHEDULE, function (schedule) {
                schedule._getOrSetProp('scheduleStatus', status);
            });
            $scope.statusMsg = statusMsgMap[status];
            setStatusPromise = CalendarScheduleAction.setStatus($scope.selectedItem.data.id, status).then(function () {
                $scope.selectedItem.refreshComments();
            }).catch(function () {
                ItemSyncService.syncItemUsingRefresh($scope.selectedItem.data, ITEM_TYPE.SCHEDULE, _.get($scope.selectedItem, 'option.showCommentWithWorkLog'));
            });
        };

        $scope.updateSchedule = function () {

            var param = {
                calendarId: $scope.selectedItem.data.calendarId,
                scheduleId: $scope.selectedItem.data.id,
                updateType: null
            };
            if ($scope.ui.visible.recurrence) {
                return CalendarUpdateRecurrenceTypeModal.open().result.then(function (result) {
                    param.updateType = result;
                    PopupUtil.openCalendarWritePopup('update', param);
                    $scope.cancel();
                });
            } else if ($scope.selectedItem.data.recurrenceType === 'modified') {
                param.updateType = 'this';
            }
            PopupUtil.openCalendarWritePopup('update', param);
            $scope.cancel();
        };

        function _removeStreamItem() {
            if (StreamModalFactory.isOpen()) {
                $scope.closeTaskView();
                StreamItemList.removeItem('schedule', $scope.selectedItem.data.id);
            }
        }

        $scope.removeSchedule = function () {
            if ($scope.selectedItem.data.recurrenceRule) {
                CalendarUpdateRecurrenceTypeModal.open('delete').result.then(function (result) {
                    CalendarScheduleAction.remove($scope.selectedItem.data.id, result).then(_removeStreamItem);
                    $scope.cancel();
                });
            } else {
                MessageModalFactory.confirm(gettextCatalog.getString("일정을 삭제하시겠습니까?")).result.then(function () {
                    CalendarScheduleAction.remove($scope.selectedItem.data.id).then(_removeStreamItem);
                    $scope.cancel();
                });
            }
        };
    }

    /* @ngInject */
    function CalendarViewBodyCtrl($q, $scope, $state, $window, EMIT_EVENTS, ITEM_TYPE, CalendarScheduleAction, ItemSyncService, MessageModalFactory, MIME_TYPE, gettextCatalog, _) {
        var window$ = angular.element($window);
        $scope.MIME_TYPE = MIME_TYPE;

        $scope.hotfix = (function () {
            var self = {
                editTarget: null,
                show: function (target) {
                    return this.cancelWithConfirm().then(function () {
                        self.editTarget = target;
                        target.show();
                    });
                },
                cancel: function () {
                    _.result(this.editTarget, 'cancel');
                    delete this.editTarget;
                    return $q.when();
                },
                cancelWithConfirm: function () {
                    if (!this.editTarget || !this.editTarget.hasChanged()) {
                        return this.cancel();
                    }

                    var message = [
                        '<p>', gettextCatalog.getString('편집 중인 내용({{::editType}})이 있습니다.', {editType: self.editTarget.label}), '</p>' +
                        '<p>', gettextCatalog.getString('댓글을 입력하거나 화면이 닫히면 편집 중인 내용이 사라집니다.'), '</p>'
                    ].join('');
                    return MessageModalFactory.confirm(message, '', {
                        focusToCancel: true,
                        confirmBtnLabel: gettextCatalog.getString('계속하기'),
                        cancelBtnLabel: gettextCatalog.getString('편집 중인 내용 보기')
                    })
                        .result.then(_.bind(self.cancel, self), _.bind(self.focus, self));
                },
                focus: function () {
                    _.result(this.editTarget, 'focus');
                    return $q.reject();
                },
                refreshWithSync: function () {
                    $scope.selectedItem.refreshItem().then(function (schedule) {
                        ItemSyncService.syncItemUsingViewItem(schedule, ITEM_TYPE.SCHEDULE);
                    });
                },
                updateItem: function (data, option) {
                    if ($scope.selectedItem.data.recurrenceType === 'modified') {
                        data.updateType = 'this';
                    }
                    return CalendarScheduleAction.update(_.get($scope.selectedItem, 'data.id'), data).then(function () {
                        if (!_.get(option, 'stopSync')) {
                            ItemSyncService.syncItemUsingRefresh($scope.selectedItem.data, ITEM_TYPE.SCHEDULE, _.get($scope.selectedItem, 'option.showCommentWithWorkLog'));
                        }
                    });
                },
                submit: function () {
                    var data;

                    if (_.isFunction(this.editTarget.createSubmitData)) {
                        data = this.editTarget.createSubmitData();
                    }

                    if ($scope.selectedItem.data.recurrenceType === 'modified') {
                        data.updateType = 'this';
                    }

                    if (_.isFunction(this.editTarget.submit)) {
                        Array.prototype.unshift.call(arguments, data);
                        this.editTarget.submit.apply(this.editTarget, arguments);
                        return;
                    }

                    if (!data) {
                        return;
                    }

                    this.updateItem(data, {reloadState: this.editTarget.type === 'subject'});
                    this.cancel();
                }
            };
            return self;
        })();

        function getInlineEditingConfirm(event) {
            var currentEditType = $scope.hotfix.currentEditType;
            if (currentEditType && $scope.hotfix[currentEditType].hasChanged()) {
                var message = gettextCatalog.getString('변경사항이 있습니다. 나가시겠습니까?');
                event.returnValue = message;
                return message;
            }
        }

        $scope.onFocusEditor = function () {
            $scope.hotfix.cancelWithConfirm();
        };

        $scope.$on(EMIT_EVENTS.COLLECT_INLINE_EDITING_PROMISE, function (event, closeModalPromises) {
            if ($scope.hotfix.currentEditType) {
                closeModalPromises.push($scope.hotfix.cancelWithConfirm());
            }
        });

        window$.on('beforeunload', getInlineEditingConfirm);

        $scope.$on('$stateChangeStart', function (event, toState, toParams) {
            if ($scope.hotfix.currentEditType) {
                event.preventDefault();
                $scope.hotfix.cancelWithConfirm().then(function () {
                    $state.go(toState, toParams);
                });
            }
        });

        $scope.$on('$destroy', function () {
            window$.off('beforeunload', getInlineEditingConfirm);
        });

        $scope.$watch('selectedItem.data.id', function () {
            $scope.hotfix.cancel();
        });
    }


})();
