(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('doorayShortcut', doorayShortcut);

    /* @ngInject */
    function doorayShortcut($state, $document, Mousetrap, DetailInstanceFactory, TaskViewModalFactory, PresentationSettingModalFactory, MeetingTaskViewModalFactory, SearchModalFactory, PopupUtil,
                            PROJECT_STATE_NAMES, MAIL_STATE_NAMES, POPUP_STATE_NAMES, KEYMAP, ITEM_TYPE) {

        function getCurrentActivePost() {
            if (TaskViewModalFactory.isOpen()) {
                return DetailInstanceFactory.getOrMakeModalItem(ITEM_TYPE.POST);
            }

            var streamPostItem = DetailInstanceFactory.getOrMakeStreamItem(ITEM_TYPE.POST);

            if (streamPostItem && _.get(streamPostItem, 'data.id')) {
                return streamPostItem;
            }

            if (($state.includes(PROJECT_STATE_NAMES.PROJECT_STATE) && $state.includes('^.view')) || $state.includes(POPUP_STATE_NAMES.TASK)) {
                return DetailInstanceFactory.getOrMakeSelectedItem(ITEM_TYPE.POST);
            }

            return {};
        }

        function getCurrentActivePostElement() {
            var postType = getCurrentActivePost().name,
                $view;
            switch (postType) {
                case 'selectedPost':
                    $view = $document.find('.main-contents-body .commonview');
                    break;
                case 'modalPost':
                    $view = $document.find('.modal-itemview .commonview');
                    break;
                case 'streamPost':
                    $view = $document.find('.stream-modal .commonview');
                    break;
            }
            return $view;
        }

        function moveState(tabState, moveState) {
            moveState = moveState || tabState;
            return function () {
                if (!$state.includes(tabState)) {
                    $state.go(moveState);
                }
                return false;
            };
        }


        return {
            restrict: 'A',
            link: function (scope) {

                function openPresentation() {
                    var selectedPost = getCurrentActivePost();

                    if (!_.isEmpty(selectedPost.data)) {
                        PresentationSettingModalFactory.open(selectedPost);
                    }
                    return false;
                }

                function openMeetingView() {
                    var selectedPost = getCurrentActivePost();

                    if (!_.isEmpty(selectedPost.data)) {
                        MeetingTaskViewModalFactory.open(selectedPost);
                    }
                    return false;
                }

                function openNewSimpleTaskWriteForm() {
                    $document.find('.simple-post-writeform-btn').trigger('click');
                    return false;
                }

                function openNewWriteForm() {
                    if ($state.includes(PROJECT_STATE_NAMES.PROJECT_STATE)) {
                        PopupUtil.openTaskWritePopup('new', {projectCode: $state.params.projectCode || $state.params.projectCodeFilter});
                    }

                    if ($state.includes(MAIL_STATE_NAMES.ROOT)) {
                        PopupUtil.openMailWritePopup('new');
                    }

                    if ($state.includes('main.page.calendar')) {
                        PopupUtil.openCalendarWritePopup('new', {
                            autoFreebusy: true
                        });
                    }

                    return false;
                }

                function openNewPopupTask() {
                    var selectedPost = getCurrentActivePost();

                    if (!_.isEmpty(selectedPost.data)) {
                        PopupUtil.openTaskViewPopup({
                            projectCode: selectedPost.data.projectCode,
                            postNumber: selectedPost.data.number
                        });
                    }

                    return false;
                }

                function openQuickSearchModalFactory(event) {
                    if (event.preventDefault) {
                        event.preventDefault();
                    } else {
                        event.returnValue = false;
                    }
                    SearchModalFactory.open('quickSearch');
                    return false;
                }

                function openStream() {
                    $document.find('.stream-btn').trigger('click');
                    return false;
                }

                function toggleFavorite() {
                    var $view = getCurrentActivePostElement();
                    if ($view) {
                        $view.find('.favorite-btn').trigger('click');
                    }
                }

                function focusToCommentWriteForm() {
                    var $view = getCurrentActivePostElement();
                    if ($view) {
                        //tuiEditor가 jQuery Object에 assign되었을때만 포커스 이동하도록 처리함 (에디터 의존성 제거)
                        var markdownEditor$ = $view.find('.comment-editor-area .markdown-editor');
                        _.isFunction(markdownEditor$.tuiEditor) && markdownEditor$.tuiEditor('focus');
                    }
                }

                function toggleZoomView() {
                    var postType = getCurrentActivePost().name;
                    if (postType === 'selectedPost') {
                        $document.find('.main-contents-body .commonview .zoom-view').trigger('click');
                    }
                }


                //vp: 발표 모드
                Mousetrap.bind(KEYMAP.OPEN_PRESENTATION_VIEW, openPresentation);

                //vm: 회의 모드
                Mousetrap.bind(KEYMAP.OPEN_MEETING_VIEW, openMeetingView);

                //ww: 쓰기 창(프로젝트면 업무 쓰기, 메일이면 메일 쓰기, 캘린더면 캘린더 쓰기)
                Mousetrap.bind(KEYMAP.OPEN_NEW_WRITEFORM, openNewWriteForm);

                //fw: 간편 쓰기 창
                Mousetrap.bind(KEYMAP.OPEN_NEW_SIMPLE_WRITEFORM, openNewSimpleTaskWriteForm);

                //vn: 새 창
                Mousetrap.bind(KEYMAP.OPEN_NEW_POST_POPUP, openNewPopupTask);

                //gp: 프로젝트 탭
                Mousetrap.bind(KEYMAP.MOVE_PROJECT_TAB, moveState(PROJECT_STATE_NAMES.PROJECT_STATE, PROJECT_STATE_NAMES.TO_BOX));

                //gm: 메일 탭
                Mousetrap.bind(KEYMAP.MOVE_MAIL_TAB, moveState(MAIL_STATE_NAMES.ROOT, MAIL_STATE_NAMES.INBOX));

                //gc: 캘린더 탭
                Mousetrap.bind(KEYMAP.MOVE_CALENDAR_TAB, moveState('main.page.calendar'));

                //gs: 스트림 열기
                Mousetrap.bind(KEYMAP.OPEN_STREAM_MODAL, openStream);

                //ms: 별 찍기 토글
                Mousetrap.bind(KEYMAP.TOGGLE_FAVORITE, toggleFavorite);

                //cc: 댓글 창으로 포커스
                Mousetrap.bind(KEYMAP.MOVE_FOCUS_COMMENT_WRITE_FORM, focusToCommentWriteForm);

                //vw: 넓게 보기 토글
                Mousetrap.bind(KEYMAP.TOGGLE_ZOOM_VIEW, toggleZoomView);

                //cmd(ctrl)+k: 최근업무 에디터 내에서도 동작하도록 global로
                Mousetrap.bindGlobal(KEYMAP.OPEN_RECENT_POST, openQuickSearchModalFactory);


                scope.$on('$destroy', function () {
                    Mousetrap.unbind(KEYMAP.OPEN_PRESENTATION_VIEW, openPresentation);
                    Mousetrap.unbind(KEYMAP.OPEN_MEETING_VIEW, openMeetingView);
                    Mousetrap.unbind(KEYMAP.OPEN_NEW_WRITEFORM, openNewWriteForm);
                    Mousetrap.unbind(KEYMAP.OPEN_NEW_SIMPLE_WRITEFORM, openNewSimpleTaskWriteForm);
                    Mousetrap.unbind(KEYMAP.OPEN_NEW_POST_POPUP, openNewPopupTask);
                    Mousetrap.unbind(KEYMAP.MOVE_PROJECT_TAB);
                    Mousetrap.unbind(KEYMAP.MOVE_MAIL_TAB);
                    Mousetrap.unbind(KEYMAP.MOVE_CALENDAR_TAB);
                    Mousetrap.unbind(KEYMAP.OPEN_STREAM_MODAL, openStream);
                    Mousetrap.unbind(KEYMAP.TOGGLE_FAVORITE, toggleFavorite);
                    Mousetrap.unbind(KEYMAP.MOVE_FOCUS_COMMENT_WRITE_FORM, focusToCommentWriteForm);
                    Mousetrap.unbind(KEYMAP.TOGGLE_ZOOM_VIEW, toggleZoomView);
                });

            }
        };
    }

})();
