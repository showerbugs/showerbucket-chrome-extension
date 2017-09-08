(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .constant('TASK_SUBMIT_FORM_TYPES', {
            TASK: 'task',
            TEMPLATE: 'template'
        })
        .factory('TaskSubmitFormFactory', TaskSubmitFormFactory)
        .factory('TaskSubmitFormBuilder', TaskSubmitFormBuilder)
        .factory('TaskTemplateSubmitFormFactory', TaskTemplateSubmitFormFactory)
        .factory('TaskTemplateSubmitFormBuilder', TaskTemplateSubmitFormBuilder);


    /* @ngInject */
    function TaskSubmitFormFactory(TagInputTaskHelper, TaskSubmitFormBuilder, MIME_TYPE, _) {
        return {
            createNew: function (form) {
                return new TaskSubmitFormBuilder().build(form);
            },

            createFromDetail: function (result) { //FOR Task Type From Draft Or Task Detail
                var content = result.contents(), refMap = result.refMap;
                return _createFromContent(content, refMap);
            },
            createFromContent: function (post) {
                return _createFromContent(post, post._wrap.refMap);
            }
        };

        function _createFromContent(content, refMap) {
            var taskSubmitForm = new TaskSubmitFormBuilder().build();

            taskSubmitForm.withForm({
                id: _.get(content, 'id', null),
                projectCode: _.get(refMap.projectMap(content.projectId), 'code'),
                number: _.get(content, 'number', null),  //TODO DRAFT RESULT 에서는 사용하지 않음
                subject: _.get(content, 'subject', ''),
                body: {
                    mimeType: _.get(content, 'body.mimeType', MIME_TYPE.MARKDOWN.type),
                    content: _.get(content, 'body.content', '')
                },
                parent: {'number': _.get(content, 'parent.number', null)},
                users: {
                    to: TagInputTaskHelper.toMemberOrGroupFromTaskDetailUser(_.get(content, 'users.to', [])),
                    cc: TagInputTaskHelper.toMemberOrGroupFromTaskDetailUser(_.get(content, 'users.cc', []))
                },
                tagIdList: _.get(content, 'tagIdList', []),
                milestoneId: _.get(content, 'milestoneId', null),
                fileIdList: _.get(content, 'fileIdList', []),
                dueDate: _.get(content, 'dueDate', null),
                dueDateFlag: _.get(content, 'dueDateFlag', false),
                startedAt: _.get(content, 'startedAt', null),
                endedAt: _.get(content, 'endedAt', null),
                priority: _.get(content, 'priority', null) === 'none' ? null : _.get(content, 'priority', null), // 'none'일 때 null 로 설정하여 '우선순위'라는 selectbox가 보이게 수정
                version: _.get(content, 'version', 0)
            })
                .withOption({
                    project: {
                        code: _.get(refMap.projectMap(content.projectId), 'code')
                    },
                    parent: {
                        number: _.get(content, 'parent.number', null),
                        subject: _.get(content, 'parent.subject', '')
                    },
                    users: {
                        to: TagInputTaskHelper.toDetailMemberOrGroupFromDetailInfo(_.get(content, 'users.to', []), refMap),
                        cc: TagInputTaskHelper.toDetailMemberOrGroupFromDetailInfo(_.get(content, 'users.cc', []), refMap),
                        from: TagInputTaskHelper.toMemberOrGroupFromTaskDetailUser(_.get(content, 'users.from'))[0]
                    },
                    organizationId: _.get(content, 'organizationId', null),
                    tagIdList: _.get(content, 'tagIdList', []),
                    milestoneId: _.get(content, 'milestoneId', null),
                    refMap: refMap   //writeformAttachedFileList.html에서 fileId를 기반으로 파일 정보 표시
                });

            return taskSubmitForm;
        }
    }

    /* @ngInject */
    function TaskSubmitFormBuilder($q, ArrayUtil, DefaultSubmitFormBuilder, TaskDraftSubmitFormApiBiz, TaskSubmitFormApiBiz, MIME_TYPE, SUBMIT_FORM_MODES, TASK_SUBMIT_FORM_TYPES, gettextCatalog, _) {
        var Constructor = angular.element.inherit(DefaultSubmitFormBuilder, {

            validateForm: function () {
                var form = this.form();
                var inValidDataList = [];
                if (_.isEmpty(form.projectCode)) {
                    inValidDataList.push({key: 'projectCode', msg: gettextCatalog.getString('프로젝트를 선택해 주세요.')});
                }

                if (_.isEmpty(_.trim(form.subject))) {
                    inValidDataList.push({key: 'subject', msg: gettextCatalog.getString('제목을 입력해 주세요.')});
                }

                return inValidDataList;
            },

            _promiseAttachMailPartFiles: null,
            submitDraft: function () {
                var self = this;
                var form = this.form();
                // milestoneId가 'none'이면 null로 변환
                form.milestoneId = form.milestoneId === 'none' ? null : form.milestoneId;
                // priority가 null이면 'none'으로 변경
                form.priority = form.priority === null ? 'none' : form.priority;
                if (!this.isDraftMode()) {
                    return $q.reject();
                }
                return TaskDraftSubmitFormApiBiz.submit(form).then(function (result) {
                    //메일 업무 등록 쓰기 화면에서 최초 드래프트 시 메일이 가진 멀티파트 파일목록을 업무 파일첨부 처리되도록 요청, 이후 드래프트 재 요청 전 단계로 이전에 파일 첨부가 완료되어야 함
                    if (!self._promiseAttachMailPartFiles && self.option('attachFromMailId')) {
                        return self._promiseAttachMailPartFiles = TaskDraftSubmitFormApiBiz.attachMailPartFiles(form.id, self.option('attachFromMailId')).then(function (res) {
                            //TODO res.result() fileList를 fileIdList로 추가 및 reference.fileMap 으로 추가처리 할수 있는지 이후 검토
                            //self.withForm('fileIdList', _.map(res.result(), 'id'));
                            self.withForm('fileList', res.result());
                            return result;
                        });
                    }
                    return result;
                });
            },

            removeDraft: function () {
                return this.isDraftMode() ? TaskDraftSubmitFormApiBiz.remove(this.form().id) : $q.reject();
            },

            submit: function () {   //save task or update task
                var self = this;
                var form = this.form();
                // milestoneId가 'none'이면 null로 변환
                form.milestoneId = form.milestoneId === 'none' ? null : form.milestoneId;
                // priority가 null이면 'none'으로 변경
                form.priority = form.priority === null ? 'none' : form.priority;
                if (this.isDraftMode()) {   //draft상태일때 먼저 draft 저장후 task로 submit
                    return this.submitDraft().then(function (result) {
                        return self._promiseAttachMailPartFiles ? self._promiseAttachMailPartFiles.then(function () {
                            return TaskSubmitFormApiBiz.saveFromDraft(form.projectCode, result.id);
                        }) : TaskSubmitFormApiBiz.saveFromDraft(form.projectCode, result.id);
                    });
                }
                return TaskSubmitFormApiBiz.update(form, this.option('project.code'));
            },

            resetFormModified: function () {
                return this.withForm(this.form());
            },

            isFormModified: function () {
                return !(
                    _.isEqual(this._originalForm.subject, this._form.subject) &&
                    _.isEqual(this._originalForm.projectCode, this._form.projectCode) &&
                    _.isEqual(this._originalForm.body.content, this._form.body.content) &&
                    _.isEqual(this._originalForm.users.to, this._form.users.to) &&
                    _.isEqual(this._originalForm.users.cc, this._form.users.cc) &&
                    _.isEqual(this._originalForm.milestoneId, this._form.milestoneId) &&
                    ArrayUtil.isEqualEntity(this._originalForm.tagIdList, this._form.tagIdList) &&
                    _.isEqual(this._originalForm.dueDate, this._form.dueDate) &&
                    _.isEqual(this._originalForm.dueDateFlag, this._form.dueDateFlag) &&
                    _.isEqual(this._originalForm.startedAt, this._form.startedAt) &&
                    _.isEqual(this._originalForm.priority, this._form.priority) &&
                    _.isEqual(this._originalForm.endedAt, this._form.endedAt)
                );
            },

            isSubPost: function () {
                return !!_.get(this.option(), 'parent.number', false);
            },

            isDraftMode: function () {
                return this.option('mode') === SUBMIT_FORM_MODES.DRAFT;
            }
        }, {
            getDefaultForm: function () {
                return {
                    //id: null,
                    projectCode: '',
                    parent: {
                        number: null
                    },
                    users: {
                        to: [],
                        cc: []
                    },
                    subject: '',
                    body: {
                        mimeType: MIME_TYPE.MARKDOWN.type,
                        content: ''
                    },
                    dueDate: null,
                    dueDateFlag: true,  //업무 신규 (완료일 미정)
                    startedAt: null,
                    endedAt: null,
                    number: null,
                    milestoneId: null,
                    tagIdList: [],
                    fileIdList: [],
                    priority: null,
                    version: 0
                };
            },
            getDefaultOption: function () {
                return {
                    type: TASK_SUBMIT_FORM_TYPES.TASK,
                    mode: SUBMIT_FORM_MODES.NEW,
                    project: {
                        code: '',
                        name: ''
                    },
                    parent: {
                        number: null,
                        subject: ''
                    },
                    users: {
                        from: null,
                        to: [],
                        cc: []
                    },
                    workflowClass: '',
                    milestoneId: null,
                    tagIdList: [],
                    fromTempSave: false,
                    refMap: {}
                };
            }
        });
        return Constructor;
    }

    /* @ngInject */
    function TaskTemplateSubmitFormFactory(TagInputTaskHelper, TaskTemplateSubmitFormBuilder, MIME_TYPE, _) {
        return {
            createNew: function (form) {
                return new TaskTemplateSubmitFormBuilder().build(form);
            },

            createFromDetail: function (result) { //FOR Task Type From Draft Or Task Detail
                var content = result.contents(), refMap = result.refMap;
                var taskTemplateSubmitForm = new TaskTemplateSubmitFormBuilder().build();
                taskTemplateSubmitForm.withForm({
                    id: _.get(content, 'id', null),
                    templateName: _.get(content, 'templateName', ''),
                    isDefault: _.get(content, 'isDefault', false),
                    projectCode: _.get(refMap.projectMap(content.projectId), 'code'),
                    subject: _.get(content, 'subject', ''),
                    body: {
                        mimeType: _.get(content, 'body.mimeType', MIME_TYPE.MARKDOWN.type),
                        content: _.get(content, 'body.content', '')
                    },
                    users: {
                        to: TagInputTaskHelper.toMemberOrGroupFromTaskDetailUser(_.get(content, 'users.to', [])),
                        cc: TagInputTaskHelper.toMemberOrGroupFromTaskDetailUser(_.get(content, 'users.cc', []))
                    },
                    tagIdList: _.get(content, 'tagIdList', []),
                    milestoneId: _.get(content, 'milestoneId', null),
                    dueDate: _.get(content, 'dueDate', null),
                    dueDateFlag: _.get(content, 'dueDateFlag', true),
                    startedAt: _.get(content, 'startedAt', null),
                    endedAt: _.get(content, 'endedAt', null)
                })
                    .withOption({
                        project: {
                            code: _.get(refMap.projectMap(content.projectId), 'code')
                        },
                        users: {
                            to: TagInputTaskHelper.toDetailMemberOrGroupFromDetailInfo(_.get(content, 'users.to', []), refMap),
                            cc: TagInputTaskHelper.toDetailMemberOrGroupFromDetailInfo(_.get(content, 'users.cc', []), refMap),
                            from: TagInputTaskHelper.toMemberOrGroupFromTaskDetailUser(_.get(content, 'users.from'))[0]
                        },
                        tagIdList: _.get(content, 'tagIdList', []),
                        milestoneId: _.get(content, 'milestoneId', null),
                        templateId: _.get(content, 'id', null),
                        refMap: refMap   //writeformAttachedFileList.html에서 fileId를 기반으로 파일 정보 표시
                    });

                return taskTemplateSubmitForm;
            }
        };
    }

    /* @ngInject */
    function TaskTemplateSubmitFormBuilder(ArrayUtil, TaskSubmitFormBuilder, TaskTemplateApiBiz, MIME_TYPE, SUBMIT_FORM_MODES, TASK_SUBMIT_FORM_TYPES, gettextCatalog, _) {
        var Constructor = angular.element.inherit(TaskSubmitFormBuilder, {
            validateForm: function () {
                var form = this.form();
                var inValidDataList = [];
                if (_.isEmpty(_.trim(form.templateName))) {
                    inValidDataList.push({key: 'templateName', msg: gettextCatalog.getString('템플릿명을 입력해 주세요 ')});
                }
                return inValidDataList;
            },

            submit: function () {   //save task or update task
                var form = this.form();
                // milestoneId가 'none'이면 null로 변환
                form.milestoneId = form.milestoneId === 'none' ? null : form.milestoneId;
                // priority가 null이면 'none'으로 변경
                form.priority = form.priority === null ? 'none' : form.priority;
                return form.id ?
                    TaskTemplateApiBiz.update(form.projectCode, form) :
                    TaskTemplateApiBiz.add(form.projectCode, form);
            },

            isFormModified: function () {
                return !(
                    _.isEqual(this._originalForm.templateName, this._form.templateName) &&
                    _.isEqual(this._originalForm.isDefault, this._form.isDefault) &&
                    _.isEqual(this._originalForm.subject, this._form.subject) &&
                    _.isEqual(this._originalForm.projectCode, this._form.projectCode) &&
                    _.isEqual(this._originalForm.body.content, this._form.body.content) &&
                    _.isEqual(this._originalForm.users.to, this._form.users.to) &&
                    _.isEqual(this._originalForm.users.cc, this._form.users.cc) &&
                    _.isEqual(this._originalForm.milestoneId, this._form.milestoneId) &&
                    _.isEqual(this._originalForm.priority, this._form.priority) &&
                    ArrayUtil.isEqualEntity(this._originalForm.tagIdList, this._form.tagIdList)
                );
            }
        }, {
            getDefaultForm: function () {
                return {
                    id: null,
                    templateName: '',
                    isDefault: false,
                    projectCode: '',
                    users: {
                        to: [],
                        cc: []
                    },
                    subject: '',
                    body: {
                        mimeType: MIME_TYPE.MARKDOWN.type,
                        content: ''
                    },
                    dueDate: null,
                    dueDateFlag: true,  //템플릿 신규 (완료일 미정)
                    startedAt: null,
                    endedAt: null,
                    milestoneId: null,
                    priority: null,
                    tagIdList: []
                };
            },
            getDefaultOption: function () {
                return {
                    type: TASK_SUBMIT_FORM_TYPES.TEMPLATE,
                    mode: SUBMIT_FORM_MODES.NEW,
                    project: {
                        code: '',
                        name: ''
                    },
                    users: {
                        to: [],
                        cc: []
                    },
                    tagIdList: [],
                    milestoneId: null,
                    templateId: null,
                    refMap: {}
                };
            }
        });
        return Constructor;
    }

})();
