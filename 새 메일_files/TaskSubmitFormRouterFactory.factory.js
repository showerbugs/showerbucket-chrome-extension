(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TaskSubmitFormRouterFactory', TaskSubmitFormRouterFactory);

    /* @ngInject */
    function TaskSubmitFormRouterFactory($q, $state, API_ERROR_CODE, POPUP_STATE_NAMES, MessageModalFactory, PostErrorHandleUtil, TaskDraftSubmitFormApiBiz, TaskSubmitFormApiBiz, TaskTemplateApiBiz, TaskSubmitFormFactory, TaskTemplateSubmitFormFactory, SUBMIT_FORM_MODES, gettextCatalog, _) {
        // Public API here
        return {
            'new': function (form, options) {
                return $q.when(TaskSubmitFormFactory.createNew()
                        .withForm(form)
                        .withOption(_.assign({
                            mode: SUBMIT_FORM_MODES.NEW
                        }, options))
                );
            },

            'newsub': function (parentCode, parentPostNumber) {   //하위 업무등록 (프로젝트 코드, 마일스톤, dueDate는 상속됨)
                return TaskSubmitFormApiBiz.fetch(parentCode, parentPostNumber).then(function (result) {
                    var content = result.contents();
                    return $q.when(TaskSubmitFormFactory.createNew()
                        .withForm({
                            parent: {number: parentPostNumber},
                            projectCode: parentCode,
                            milestoneId: _.get(content, 'milestoneId', null),
                            dueDate: _.get(content, 'dueDate', null),
                            dueDateFlag: _.get(content, 'dueDateFlag', false)
                        })
                        .withOption({
                            mode: SUBMIT_FORM_MODES.NEW,
                            project: {
                                code: parentCode
                            },
                            parent: {
                                number: parentPostNumber,
                                subject: _.get(content, 'subject', '')
                            },
                            milestoneId: _.get(content, 'milestoneId', null)
                        }));
                });
            },

            'draft': function (draftId) {    //임시 저장
                return TaskDraftSubmitFormApiBiz.fetch(draftId).then(function (result) {
                    return $q.when(TaskSubmitFormFactory.createFromDetail(result)
                        .withOption({
                            mode: SUBMIT_FORM_MODES.DRAFT
                        }));
                });
            },

            'update': function (code, number) {   //업무 수정
                return TaskSubmitFormApiBiz.fetch(code, number).then(function (result) {
                    return $q.when(TaskSubmitFormFactory.createFromDetail(result)
                        .withOption({
                            mode: SUBMIT_FORM_MODES.UPDATE,
                            workflowClass: _.get(result.contents(), 'workflowClass', 'registered'),
                            milestoneId: _.get(result.contents(), 'milestoneId', null),
                            tagIdList: _.get(result.contents(), 'tagIdList', [])
                        }));
                }, function (errorResponse) {
                    var errorActions = {};
                    errorActions[API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED] = function () {
                        var errorMsg = gettextCatalog.getString('해당 업무가 삭제되었습니다.');
                        return MessageModalFactory.alert(errorMsg).result.then(function () {
                            $state.go(POPUP_STATE_NAMES.TASK_VIEW, {projectCode: code, postNumber: number}, {reload: POPUP_STATE_NAMES.TASK_VIEW});
                        });
                    };
                    errorActions[API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED] = function (projectCode, postNumber) {
                        $state.go(POPUP_STATE_NAMES.TASK_WRITE_UPDATE, {projectCode: projectCode, postNumber: postNumber}, {reload: POPUP_STATE_NAMES.TASK_WRITE_UPDATE});
                    };

                    return PostErrorHandleUtil.onPostError(errorResponse, errorActions);
                });
            },

            'newFromTemplateId': function (code, templateId) {   //템플릿으로 부터 submitForm 생성
                return TaskTemplateApiBiz.get(code, templateId, true).then(function (result) {
                    var template = result.contents();
                    return $q.when(TaskSubmitFormFactory.createFromDetail(result)
                        .withForm({
                            id: null,
                            projectCode: code,
                            template: {id: template.id}
                        })
                        .withOption({project: {code: code}}));
                });
            },

            'newsubFromTemplateId': function (parentCode, parentPostNumber, templateId) {   //템플릿으로 부터 submitForm 생성하되 부모의 milestone, dueDate는 상속 유지
                var self = this;
                return this.newsub(parentCode, parentPostNumber).then(function (submitFormFromParent) {
                    return self.newFromTemplateId(parentCode, templateId).then(function (submitFormFromTemplate) {
                        return $q.when(submitFormFromTemplate
                                .withForm({
                                    parent: {number: parentPostNumber},
                                    milestoneId: submitFormFromParent.form('milestoneId') || submitFormFromTemplate.form('milestoneId'),
                                    dueDate: submitFormFromParent.form('dueDate') || submitFormFromTemplate.form('dueDate'),
                                    dueDateFlag: submitFormFromParent.form('dueDateFlag') || submitFormFromTemplate.form('dueDateFlag')
                                })
                                .withOption({
                                    parent: {number: parentPostNumber},
                                    milestoneId: submitFormFromParent.form('milestoneId') || submitFormFromTemplate.form('milestoneId')
                                })
                        );
                    });
                });
            },

            'newFromTask': function (code, number) {
                return TaskSubmitFormApiBiz.fetch(code, number).then(function (result) {
                    var newSubmitFormFromTask = TaskSubmitFormFactory.createFromDetail(result)
                        .withForm({id: null, number: null, fileIdList: [], parent: {}});
                    //tagIdList, milestoneId는 신규 쓰기에서도 UI 복원을 위해 option 유지
                    return $q.when(newSubmitFormFromTask
                            .withOption(_.assign(TaskSubmitFormFactory.createNew().option(), {
                                users: {
                                    to: newSubmitFormFromTask.option('users.to'),
                                    cc: newSubmitFormFromTask.option('users.cc')
                                },
                                tagIdList: newSubmitFormFromTask.option('tagIdList'),
                                milestoneId: newSubmitFormFromTask.option('milestoneId')
                            }))
                    );
                });
            },

            //TODO 수정필요
            'template': function (code, templateId) {   //템플릿 등록/수정
                return templateId ? TaskTemplateApiBiz.get(code, templateId).then(function (result) {
                    return $q.when(TaskTemplateSubmitFormFactory.createFromDetail(result)
                        .withForm({projectCode: code})
                        .withOption({mode: SUBMIT_FORM_MODES.UPDATE}));
                }) : $q.when(TaskTemplateSubmitFormFactory.createNew()
                        .withForm({projectCode: code})
                        .withOption({mode: SUBMIT_FORM_MODES.NEW})
                );
            }

        };
    }

})();
