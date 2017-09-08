(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .constant('MAIL_SUBMIT_FORM_TYPES', {
            MAIL: 'mail'
        })
        .factory('MailSubmitFormFactory', MailSubmitFormFactory)
        .factory('MailSubmitFormBuilder', MailSubmitFormBuilder);

    /* @ngInject */
    function MailSubmitFormFactory(MIME_TYPE, MailSubmitFormBuilder, TagInputMailHelper, _) {

        return {
            createNew: function (form) {
                return new MailSubmitFormBuilder().build(form);
            },

            createFromDetail: function (result, relation) { //FOR Mail Type From Draft, From Mail Contents
                var content = result.contents(), refMap = result.refMap;
                var mailSubmitForm = new MailSubmitFormBuilder().build();
                mailSubmitForm.withForm({
                    id: _.get(content, 'id', null),
                    subject: _.get(content, 'subject', ''),
                    body: {
                        mimeType: _.get(content, 'body.mimeType', MIME_TYPE.HTML.type),
                        content: _.get(content, 'body.content', '')
                    },
                    users: {
                        from: null, // mail draft에서 나의 메일 목록 중 보낸사람 EmailAddressesId option('usersFrom')이 기본 선택값
                        to: TagInputMailHelper.toEmailFormFromMailDetailUser(_.get(content, 'users.to')),
                        cc: TagInputMailHelper.toEmailFormFromMailDetailUser(_.get(content, 'users.cc'))
                    },
                    fileList: _.get(content, 'fileList', []),
                    security: _.get(content, 'mail.security', mailSubmitForm.form('security')),
                    relation: !_.isEmpty(relation) ? relation : _.get(content, 'relation', {}),   // { type: 'reply', mailId: '1' },
                    //DRAFT 상태일때만 전달되는 데이터
                    individualSend: _.get(content, 'individualSend', mailSubmitForm.form('individualSend')),
                    securityEditable: _.get(content, 'securityEditable', mailSubmitForm.form('securityEditable'))
                }).withOption({
                    signature: '',
                    usersFrom: _.get(content, 'users.from', null),
                    users: {
                        to: _.get(content, 'users.to'),
                        cc: _.get(content, 'users.cc')
                    },
                    refMap: refMap   //writeformAttachedFileList.html에서 fileId를 기반으로 파일 정보 표시
                });

                return mailSubmitForm;
            }
        };
    }

    /* @ngInject */
    function MailSubmitFormBuilder($q, DefaultSubmitFormBuilder, HtmlUtil, MailDraftSubmitFormApiBiz, MailSubmitFormApiBiz, MAIL_SUBMIT_FORM_TYPES, MIME_TYPE, SUBMIT_FORM_MODES, gettextCatalog, _) {
        var Constructor = angular.element.inherit(DefaultSubmitFormBuilder, {

            validateForm: function () {
                var form = this.form();
                var inValidDataList = [];
                if (!form.users.to.length) {
                    inValidDataList.push({key: 'to', msg: gettextCatalog.getString('받는 사람을 지정해 주세요.')});
                }

                if (!_.trim(form.subject).length) {
                    inValidDataList.push({key: 'subject', msg: gettextCatalog.getString('제목을 입력해 주세요.')});
                }
                return inValidDataList;
            },

            _promiseAttachMailPartFiles: null,
            submitDraft: function () {
                var self = this;
                var form = this.form();
                if (!this.isDraftMode()) {
                    return $q.reject();
                }
                return MailDraftSubmitFormApiBiz.submit(form).then(function (result) {
                    //메일 재전송 전달 쓰기 화면에서 최초 드래프트 시 메일이 가진 멀티파트 파일목록을 새메일의 첨부파일 처리되도록 요청, 이후 드래프트 재 요청 전 단계로 이전에 파일 첨부가 완료되어야 함
                    if (!self._promiseAttachMailPartFiles && self.option('attachFromMailId')) {
                        return self._promiseAttachMailPartFiles = MailDraftSubmitFormApiBiz.attachMailPartFiles(form.id, self.option('attachFromMailId')).then(function (res) {
                            self.withForm('fileList', res.result());
                            return result;
                        });
                    }
                    return result;
                });
            },
            removeDraft: function () {
                if (!this.isDraftMode()) {
                    return $q.reject();
                }
                return MailDraftSubmitFormApiBiz.remove(this.form().id);
            },

            submit: function () {   //save task or update task
                var self = this;
                if (this.isDraftMode()) {   //draft상태일때 먼저 draft 저장후 task로 submit
                    return this.submitDraft().then(function (result) {
                        return self._promiseAttachMailPartFiles ? self._promiseAttachMailPartFiles.then(function () {
                            return MailSubmitFormApiBiz.saveFromDraft(result.id);
                        }) : MailSubmitFormApiBiz.saveFromDraft(result.id);
                    });
                }
                return $q.reject();
            },

            resetFormModified: function () {
                return this.withForm(this.form());
            },

            isFormModified: function () {
                return !(
                    _.isEqual(this._originalForm.subject, this._form.subject) &&
                    _.isEqual(
                        HtmlUtil.ignoreBlankHtml(this._originalForm.body.content),
                        HtmlUtil.ignoreBlankHtml(this._form.body.content)
                    ) &&
                    _.isEqual(this._originalForm.users.to, this._form.users.to) &&
                    _.isEqual(this._originalForm.users.cc, this._form.users.cc) &&
                    _.isEqual(this._originalForm.security, this._form.security) &&
                    _.isEqual(this._originalForm.individualSend, this._form.individualSend)
                );
            },

            isDraftMode: function () {
                return this.option('mode') === SUBMIT_FORM_MODES.DRAFT;
            }
        }, {
            getDefaultForm: function () {
                return {
                    id: null,
                    users: {
                        from: null,
                        to: [],
                        cc: []
                    },
                    subject: '',
                    body: {
                        mimeType: MIME_TYPE.HTML.type,
                        content: ''
                    },
                    fileList: [],
                    //대외비를 위한 기본 데이터 추가
                    security: {
                        level: 'normal',    //'normal', 'in_house', 'secret'
                        resend: true,
                        autoDelete: false,
                        retentionDays: 0
                    },
                    relation: {},
                    //DRAFT 상태일때만 전달되는 데이터
                    securityEditable: true,
                    individualSend: false
                };
            },
            getDefaultOption: function () {
                return {
                    type: MAIL_SUBMIT_FORM_TYPES.MAIL,
                    mode: SUBMIT_FORM_MODES.DRAFT,
                    usersFrom: null,
                    users: {
                        to: [],
                        cc: []
                    },
                    refMap: {},
                    signature: ''
                };
            }
        });
        return Constructor;
    }

})();
