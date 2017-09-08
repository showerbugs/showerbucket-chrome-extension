(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailSubmitFormRouterFactory', MailSubmitFormRouterFactory);

    /* @ngInject */
    function MailSubmitFormRouterFactory($q, MIME_TYPE, SUBMIT_FORM_MODES,
                                         EmailAddressClassifyBiz,
                                         MailSignatureRepository,
                                         HelperAddressUtil, MailAttachedFileUtil, MailItemSecurityUtil, MailSignatureUtil,
                                         MailDistributionListBiz, MailDraftSubmitFormApiBiz, MailSubmitFormApiBiz,
                                         MailSubmitFormFactory, MemberMeEmailAddresses, ResponseWrapAppendHelper, TaskSubmitFormFactory, TagInputMailHelper, _) {

        return {
            'new': function (paramForm) {    //메일 신규
                return $q.all([MemberMeEmailAddresses.fetchListWithConfirmStatus(), MailSignatureRepository.fetchAndCache()]).then(function (result) {
                    var submitForm = MailSubmitFormFactory.createNew();
                    var defaultFrom = _.find(result[0].contents(), 'default', true) || result[0].contents()[0];
                    paramForm = paramForm || {};
                    _.set(paramForm, 'users.from', TagInputMailHelper.makeEmailForm(defaultFrom.displayName, defaultFrom.emailAddress));
                    submitForm.withForm(paramForm);
                    var signature = MailSignatureUtil.getModeSignature(MailSignatureRepository.getContent(), 'new');
                    submitForm.withOption('signature', signature);
                    submitForm.withForm('body.content', '<br/><br/>' + MailSignatureUtil.wrapPositionComments(signature));
                    if (_.get(paramForm, 'users.to')) {
                        submitForm.withOption('users.to', TagInputMailHelper.toMailDetailUserFromEmailForm(paramForm.users.to));
                    }
                    if (_.get(paramForm, 'users.cc')) {
                        submitForm.withOption('users.cc', TagInputMailHelper.toMailDetailUserFromEmailForm(paramForm.users.cc));
                    }
                    return submitForm;
                });
            },

            'draft': function (draftId) {    //임시 저장
                return MailDraftSubmitFormApiBiz.fetch(draftId).then(function (result) {
                    return $q.when(MailSubmitFormFactory.createFromDetail(result, {})
                        .withForm({
                            version: _.get(result, 'version', null)
                        }));
                }).then(updateUsersFromForDefaultSender);
            },

            'registertask': function (mailId) {   //메일에서 업무 등록형식으로 변경 ( dueDate 미정 )
                return MailSubmitFormApiBiz.fetch(mailId).then(function (result) {
                    var content = result.contents();
                    var taskSubmitForm = TaskSubmitFormFactory.createNew({
                        users: {
                            to: [],
                            cc: []
                        },
                        subject: _.get(content, 'subject', ''),
                        fileIdList: [], //mail form.fileList에서 채워줌
                        fileList: MailAttachedFileUtil.filterAttachedMimeFileList(content.fileList),  //메일에서 대용량을 제외한 마임 파일만 목록에 표시함
                        dueDateFlag: true
                    });
                    //현재는 메일에서 업무 등록시에도 마크다운 에디터로 표시하도록 함
                    taskSubmitForm.withForm('body.content', createMailBodyFormatFromMailInfo(content));
                    taskSubmitForm.withForm('body.mimeType', MIME_TYPE.HTML.type);
                    taskSubmitForm.withOption('newType', 'registertask');
                    taskSubmitForm.withOption('mode', SUBMIT_FORM_MODES.DRAFT); //업무 신규 등록을 강제로 드래프트로 변경
                    taskSubmitForm.withOption('forceDraft', true);
                    taskSubmitForm.withOption('attachFromMailId', mailId);
                    return $q.when(taskSubmitForm);
                });
            },

            'reply': function (mailOrId) {  //답장
                return createReplyDefaultForm(mailOrId).then(function (resultWithSubmitForm) {
                    var content = resultWithSubmitForm.content,
                        submitForm = resultWithSubmitForm.submitForm;
                    submitForm.withForm('users.to', [_.get(content, 'users.from')]);
                    submitForm.withForm('users.cc', []);
                    submitForm.withForm('fileList', []);      //답장은 파일 전달 안함
                    submitForm.withOption('users.to', [_.get(content, 'users.from')]);
                    submitForm.withOption('users.cc', []);
                    submitForm.withOption('newType', 'reply');
                    return $q.when(submitForm);
                }).then(updateUsersFromForDefaultSender);
            },

            'replyall': function (mailId) {  //전체 답장
                return createReplyDefaultForm(mailId).then(function (resultWithSubmitForm) {
                    var content = resultWithSubmitForm.content,
                        submitForm = resultWithSubmitForm.submitForm;
                    var toNewArrExceptMe = _.cloneDeep(submitForm.form('users.to'));
                    var toNewArrExceptMeTypeOption = _.cloneDeep(submitForm.option('users.to'));
                    toNewArrExceptMe.push(_.get(content, 'users.from'));
                    toNewArrExceptMeTypeOption.push(_.get(content, 'users.from'));
                    submitForm.withForm('fileList', []);      //답장은 파일 전달 안함
                    submitForm.withForm('users.to', _.uniq(toNewArrExceptMe));
                    submitForm.withOption('users.to', _.uniqWith(toNewArrExceptMeTypeOption, _.isEqual));
                    submitForm.withOption('newType', 'replyall');
                    return $q.when(submitForm);
                }).then(updateUsersFromForDefaultSender);
            },

            'resend': function (mailId) {  //다시보내기
                return MailSubmitFormApiBiz.fetch(mailId).then(function (result) {
                    //console.warn('TODO relation 추가 방식을 어떻게 할건지 결정 필요');
                    var submitForm = MailSubmitFormFactory.createFromDetail(result, {});
                    submitForm.withForm('id', null);
                    submitForm.withForm('securityEditable', true);
                    submitForm.withOption('newType', 'resend');
                    submitForm.withOption('forceDraft', true);
                    submitForm.withOption('attachFromMailId', mailId);
                    return $q.when(submitForm);
                }).then(updateUsersFromForDefaultSender);
            },

            'forward': function (mailOrId) {    //메일 전달
                return $q.all([fetchMailInstance(mailOrId), MailSignatureRepository.fetchAndCache()]).then(function (result) {
                    var content = result[0].contents();
                    var submitForm = MailSubmitFormFactory.createFromDetail(result[0], {
                        type: 'forward',
                        mailId: content.id
                    });
                    var signature = MailSignatureUtil.getModeSignature(MailSignatureRepository.getContent(), 'forward');
                    submitForm.withOption('signature', signature);
                    submitForm.withForm('body.content', ['<br/><br/>' + MailSignatureUtil.wrapPositionComments(signature), createMailBodyFormatFromMailInfo(content)].join(''));
                    submitForm.withForm('body.mimeType', MIME_TYPE.HTML.type);
                    submitForm.withForm('id', null);
                    submitForm.withForm('subject', 'FW:' + submitForm.form('subject'));
                    submitForm.withForm('users.to', []);
                    submitForm.withForm('users.cc', []);
                    submitForm.withOption('users.to', []);
                    submitForm.withOption('users.cc', []);
                    submitForm.withOption('newType', 'forward');
                    submitForm.withOption('forceDraft', true);
                    if (_.isString(mailOrId)) {
                        submitForm.withOption('attachFromMailId', mailOrId);
                    }
                    return $q.when(submitForm);
                }).then(updateUsersFromForDefaultSender);
            }
        };

        function createMailBodyFormatFromMailInfo(mailDetail) {
            return (
                '<br><br>' +
                _.template([
                    '-----Original Message-----',
                    'From:  &quot;<%= mailDetail.users.from.emailUser.name %>&quot; &lt;<%= mailDetail.users.from.emailUser.emailAddress %>&gt;',
                    'To:    <% _.each(mailDetail.users.to, function(user) { %> <% if (user[user.type].name){ %>&quot;<%= user[user.type].name %>&quot;<% } %> &lt;<%= user[user.type].emailAddress %>&gt;; <% });%>',
                    'Cc:    <% _.each(mailDetail.users.cc, function(user) { %> <% if (user[user.type].name){ %>&quot;<%= user[user.type].name %>&quot;<% } %> &lt;<%= user[user.type].emailAddress %>&gt;; <% });%>',
                    'Sent:  <%= mailDetail.mail.sentAt %>',
                    'Subject: <%= mailDetail.subject %>'
                ].join('<br>'))({
                    mailDetail: mailDetail
                }) +
                '<br><br>' +
                _.get(mailDetail, 'body.content', '')
            );
        }

        function fetchMailInstance(mailOrId) {
            if (_.isString(mailOrId)) {
                return MailSubmitFormApiBiz.fetch(mailOrId);
            }
            var references = {};
            _.forEach(mailOrId._wrap.refMap, function (func, name) {
                references[name] = func();
            });

            return $q.when(ResponseWrapAppendHelper.create({content: mailOrId, references: references}));
        }

        function createReplyDefaultForm(mailOrId) {
            return $q.all([fetchMailInstance(mailOrId), MailSignatureRepository.fetchAndCache()]).then(function (result) {
                var content = result[0].contents();
                var mailSubmitForm = MailSubmitFormFactory.createFromDetail(result[0], {
                    type: 'reply',
                    mailId: content.id
                });

                var signature = MailSignatureUtil.getModeSignature(MailSignatureRepository.getContent(), 'reply');
                mailSubmitForm.withOption('signature', signature);
                //원본 메일이 기밀이나 대외비일때 보안 레별 설정 변경을 막도록 함
                mailSubmitForm.withForm('securityEditable', MailItemSecurityUtil.isNormal(mailSubmitForm.form('security.level')));
                mailSubmitForm.withForm('body.content', ['<br/><br/>' + MailSignatureUtil.wrapPositionComments(signature), createMailBodyFormatFromMailInfo(content)].join(''));
                mailSubmitForm.withForm('body.mimeType', MIME_TYPE.HTML.type);
                mailSubmitForm.withForm({
                    id: null,
                    subject: 'RE:' + mailSubmitForm.form('subject')
                });
                return $q.when({content: content, submitForm: mailSubmitForm});
            });
        }

        function updateUsersFromForDefaultSender(submitForm) {
            return MemberMeEmailAddresses.fetchListWithConfirmStatus().then(function (result) {
                var contents = result.contents();
                //usersFromEmail이 내 메일 목록에 있으면 선택, 없으면 내 메일 목록의 default === true를 선택, 없으면 null
                var usersFromEmail = submitForm.option('usersFrom.emailUser.emailAddress');
                var defaultFrom = _.find(contents, ['emailAddress', usersFromEmail]) || _.find(contents, ['default', true]);
                submitForm.withForm('users.from',
                    TagInputMailHelper.makeEmailForm(defaultFrom.displayName, defaultFrom.emailAddress));
                return classifyToAndCcUser(submitForm);
            });
        }

        function classifyToAndCcUser(submitForm) {
            var mergedToAndCcUsers = _(submitForm.option('users').to || []).concat(submitForm.option('users').cc || []);
            var allEmails = mergedToAndCcUsers.map(function (memberWrapper) {
                return memberWrapper[memberWrapper.type].emailAddress;
            }).value();

            if (allEmails.length === 0) {
                return $q.when(submitForm);
            }

            return EmailAddressClassifyBiz.query(allEmails).then(function (result) {
                var userMap = result.result();
                return $q.all(mergedToAndCcUsers.map(function (memberWrapper) {
                    //email type에 대한 dl 여부를 반영함
                    _.merge(memberWrapper, userMap[memberWrapper[memberWrapper.type].emailAddress]);
                    if (memberWrapper.type === 'distributionList') {
                        return MailDistributionListBiz.fetch(memberWrapper.distributionList.id).then(function (result) {
                            memberWrapper.distributionList.distributionItemList = result.contents().distributionItemList;
                            memberWrapper.distributionList.allMemberTooltip = _(result.contents().distributionItemList).map(function (_memberWrapper) {
                                var member = _memberWrapper[_memberWrapper.type];
                                return HelperAddressUtil.makeDisplayInMail(member.name, member.emailAddress);
                            }).value().join(', ');
                        });
                    }
                })).then(function () {
                    return submitForm;
                });
            });
        }
    }

})();
