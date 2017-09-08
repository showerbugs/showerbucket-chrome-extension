(function () {

    'use strict';

    angular
        .module('doorayWebApp.stream')
        .component('streamWindow', {
            templateUrl: 'modules/stream/window/streamWindow/streamWindow.html',
            controller: StreamWindow,
            bindings: {
                modalInstance: '<'
            }
        });

    function StreamWindow($q, $scope, $timeout, $uiViewScroll,
                          EMIT_EVENTS, ITEM_TYPE,
                          DetailInstanceFactory, DigestService,
                          MailRepositoryItemPropertySyncAction,
                          MailStreamViewRepository, StreamItemList, RootScopeEventBindHelper, _) {
        var $ctrl = this;

        $ctrl.MailStreamViewRepository = MailStreamViewRepository;
        $ctrl.streamPost = DetailInstanceFactory.getOrMakeStreamItem(ITEM_TYPE.POST);
        $ctrl.streamSchedule = DetailInstanceFactory.getOrMakeStreamItem(ITEM_TYPE.SCHEDULE);

        $ctrl.resetViews = resetViews;
        $ctrl.closeModal = closeModal;
        $ctrl.viewPostContent = viewPostContent;
        $ctrl.viewMailContent = viewMailContent;
        $ctrl.viewScheduleContent = viewScheduleContent;

        $scope.$on('modal.closing', function ($event, resultOrReason, isClosed) {
            //모달창을 닫기전에 현재 에디팅되는 인라인 편집부분이 있는지 확인하는 용도입니다.
            if (isClosed || _.isUndefined(resultOrReason)) {
                return;
            }

            _canCloseViewPromise($event).then(function () {
                $ctrl.modalInstance.dismiss();
            });
        });

        $scope.$on('$stateChangeSuccess', function () {
            closeModal();
        });

        function resetViews() {
            $ctrl.streamPost.reset();
            MailStreamViewRepository.clear();
            $ctrl.streamSchedule.reset();
        }

        function closeModal() {
            $ctrl.modalInstance.close();
        }

        // focusTarget = {eventId: '123', type: 'event' | 'eventList'}
        function viewPostContent(streamItem, focusTarget) {
            focusTarget = focusTarget || {};
            _canRefreshContentPromise().then(function () {
                var post = streamItem._wrap.refMap.postMap(streamItem.post.id),
                    projectCode = streamItem._wrap.refMap.projectMap(post.projectId).code;

                $ctrl.streamPost.focusCommentId = focusTarget.eventId;
                return $ctrl.streamPost.setParam(projectCode, post.number, {showCommentWithWorkLog: focusTarget.type === 'event'});
            }).then(function () {
                if (!_.isEmpty(focusTarget)) {
                    _scrollInView($ctrl.streamPost.name, focusTarget);
                }
                _setReadWithEventList(ITEM_TYPE.POST, streamItem);
            });
        }

        function viewMailContent(streamItem) {
            _canRefreshContentPromise().then(function () {
                return MailStreamViewRepository.fetchAndCache({mailId: streamItem.mail.id}).then(function (res) {
                    //#dooray-qa/2135 메일 본문 요청 시 메일 목록도 읽음 처리 UI-SYNC
                    MailRepositoryItemPropertySyncAction.syncListRepositoryItemReadFlag([streamItem.mail.id], true);
                    return res;
                });
            }).then(function () {
                _setReadItems(ITEM_TYPE.MAIL, streamItem);
                DigestService.safeLocalDigest($scope);
            });
        }

        // focusTarget = {eventId: '123', type: 'event' | 'eventList'}
        function viewScheduleContent(streamItem, focusTarget) {
            focusTarget = focusTarget || {};
            _canRefreshContentPromise().then(function () {
                $ctrl.streamSchedule.focusCommentId = focusTarget.eventId;
                return $ctrl.streamSchedule.setParam(streamItem.schedule.id, {showCommentWithWorkLog: focusTarget.type === 'event'});
            }).then(function () {
                if (_.isEmpty(focusTarget)) {
                    _scrollInView($ctrl.streamSchedule.name, focusTarget);
                }
                _setReadWithEventList(ITEM_TYPE.SCHEDULE, streamItem);
            });
        }

        function _stopClosingViewPromise() {
            //escape key press and dismissed
            var editingPromises = [];
            RootScopeEventBindHelper.emit(EMIT_EVENTS.COLLECT_INLINE_EDITING_PROMISE, editingPromises);
            return _.isEmpty(editingPromises) ? $q.reject() : $q.all(editingPromises);
        }

        function _canCloseViewPromise($event) {
            $event && $event.preventDefault();

            return _stopClosingViewPromise().then(function () {
                return (
                    $ctrl.streamPost.data.id ||
                    MailStreamViewRepository.getContent().id ||
                    $ctrl.streamSchedule.data.id
                ) ? $q.reject('existView') : $q.when();
            }, function () {
                return $q.when();
            });
        }

        function _canRefreshContentPromise() {
            return _canCloseViewPromise().then(function () {
                resetViews();
                return $q.when();
            }, function (reason) {
                return reason === 'existView' ? $q.when() : $q.reject();
            });
        }

        function _scrollInView(viewName, target) {
            if (!viewName || !target) {
                return;
            }

            $timeout(function () {
                var target$ = target.type === 'eventList' ?
                    angular.element(['#', viewName, '-commentlist-anchor'].join('')) :
                    angular.element(['#', viewName, '-commentlist-anchor-', target.eventId].join(''));
                if (!_.isEmpty(target$)) {
                    $uiViewScroll(target$);
                }
            }, 500, false);
        }

        function _setReadWithEventList(type, streamItem) {
            StreamItemList.applyFunction(streamItem[type].id, type, function (targetItem) {
                targetItem._getOrSetProp('showContent', !targetItem[type].read);
                targetItem[type].read = true;

                _.forEach(targetItem.eventList, function (event) {
                    event.read = true;
                });
            }, {needStreamItem: true});
        }

        function _setReadItems(type, streamItem) {
            StreamItemList.applyFunction(streamItem[type].id, type, function (targetItem) {
                targetItem[type].read = true;
            }, {needStreamItem: true});
        }

    }

})();
