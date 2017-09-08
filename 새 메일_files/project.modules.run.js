(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .constant('PROJECT_STATE_NAMES', {
            PROJECT_STATE: 'main.page.project',
            TO_BOX: 'main.page.project.tobox',                      TO_BOX_VIEW: 'main.page.project.tobox.view',
            CC_BOX: 'main.page.project.ccbox',                      CC_BOX_VIEW: 'main.page.project.ccbox.view',
            SEARCH_BOX: 'main.page.project.search',                 SEARCH_BOX_VIEW: 'main.page.project.search.view',
            SENT_BOX: 'main.page.project.sentbox',                  SENT_BOX_VIEW: 'main.page.project.sentbox.view',
            DRAFT_BOX: 'main.page.project.draft',                   DRAFT_BOX_VIEW: 'main.page.project.draft.view',
            PROJECT_BOX: 'main.page.project.projects',              PROJECT_BOX_VIEW: 'main.page.project.projects.view',        PROJECT_BOX_VIEW_COMMENT: 'main.page.project.projects.view.comment',
            IMPORTANT_BOX: 'main.page.project.important',           IMPORTANT_BOX_VIEW: 'main.page.project.important.view',
            COMMENT_BOX: 'main.page.project.comment',               COMMENT_BOX_VIEW: 'main.page.project.comment.view',
            MENTION_BOX: 'main.page.project.mention',               MENTION_BOX_VIEW: 'main.page.project.mention.view'
        })
        .constant('TASK_SEARCH_PARAM_STORAGE_VERSION', 4)
        .constant('LIST_CONTENT_MAX_LENGTH', 350)
        /* @ngInject */
        .config(function ($httpProvider) {

            /* @ngInject */
            $httpProvider.interceptors.push(function ($injector, $q, PROJECT_STATE_NAMES, httpStatusCode) {
                return {
                    responseError: function (errorResponse) {
                        if (errorResponse.config.ignore) {
                            //1. 알림 써머리가 30초 주기로 호출되므로 배포 시마다 Alert Dialog 실행이되는 부분 스킵
                            //2. 프로젝트 테스크+메시지 목록 요청인 경우 에러 발생 시에도 얼럿 노출  제외함
                            var ignoreResponseError = errorResponse.config.ignore.responseError;
                            if (_.isFunction(ignoreResponseError) ? ignoreResponseError(errorResponse.config) : !!ignoreResponseError) {
                                return $q.reject(errorResponse);
                            }
                        }
                        if (errorResponse.status === httpStatusCode.FORBIDDEN) {
                            var $state = $injector.get('$state');
                            // FIXME 이 부분은 homeScript에서 injection을 하여 예외적으로 추가한 코드,
                            // 추후에 homeScript에서 injection 제거 후 코드 제거
                            if (!$state.includes(PROJECT_STATE_NAMES.PROJECT_STATE)) {
                                return $q.reject(errorResponse);
                            }

                            var MeetingTaskViewModalFactory = $injector.get('MeetingTaskViewModalFactory'),
                                TaskViewModalFactory = $injector.get('TaskViewModalFactory'),
                                StreamModalFactory = $injector.get('StreamModalFactory');

                            if ($state.includes('^.view') &&
                                !MeetingTaskViewModalFactory.isOpenedMeetingView() &&
                                !TaskViewModalFactory.isOpen() &&
                                !StreamModalFactory.isOpen()
                            ) {
                                $state.go('^');
                            }
                        }
                        return $q.reject(errorResponse);
                    }
                };
            });
        });
})();
