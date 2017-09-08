(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .controller('MailWriteformEditorCtrl', MailWriteformEditorCtrl)
        .controller('MailWriteformFragmentsHeadCtrl', MailWriteformFragmentsHeadCtrl)
        .controller('MailWriteformFragmentsBodyCtrl', MailWriteformFragmentsBodyCtrl);

    /* @ngInject */
    function MailWriteformEditorCtrl($element, $q, $scope, $timeout,
                                     MailSignatureUtil,
                                     bytesFormatFilter,
                                     MailAttachmentSettingsRepository, MailSignatureRepository,
                                     MailDraftFileAction,
                                     MessageModalFactory, WriteFormShare,
                                     gettextCatalog, moment, _) {
        _init();

        $scope.options = {};
        $scope.draftAction.setRemoveConfirmMsg(gettextCatalog.getString('mail.writeform~~임시 저장된 메일을 삭제하시겠습니까?~~'));

        var form = WriteFormShare.submitForm().form();

        $scope.getMailAttachmentSettings = getMailAttachmentSettings;
        $scope.getRetentionDayGuideInFileList = getRetentionDayGuideInFileList;
        $scope.getBigFileList = getBigFileList;
        $scope.sumTotalMimeSize = sumTotalMimeSize;
        $scope.sumBigFileListSize = sumBigFileListSize;
        $scope.getBigFileUploadTargetPostfix = getBigFileUploadTargetPostfix;
        $scope.onRemovedFiles = onRemovedFiles;
        $scope.changeSignature = changeSignature;

        $scope.onLoadEditor = function (editor) {
            $scope.editor = editor;
            //TODO 에디터에 값을 최초 설정할때 form.body.content 데이터와 에디터 삽입후의 데이터가 변경되므로 submitForm.isFormModified() 조건 초기화
            WriteFormShare.submitForm().withForm('body.content', $scope.form.body.content).resetFormModified();

            if ($scope.mode.isDraft) {
                $scope.draftAction.watchForAutoSave();
            }

            //메일 전송에 대한 validation 처리는 MailAttachmentSettingsRepository 로 부터 받아서 사용함
            MailAttachmentSettingsRepository.fetchAndCache().then(function () {
                var restoredLastBodyContent;
                $scope.$watch('form.body.content', function (newVal, oldVal) {
                    if (newVal === restoredLastBodyContent) {    //신규로 입력된 본문이 복원된 내용과 동일하면 무시함
                        return;
                    }
                    var allContentsSize = sumTotalMimeSize();
                    //일반 파일 마임 첨부 20MB 제한
                    var mimeSizeLimit = getMailAttachmentSettings().mimeSizeLimit;
                    if (allContentsSize > mimeSizeLimit) {
                        _.set(form, 'body', {
                            content: oldVal,
                            mimeType: $scope.form.body.mimeType
                        });
                        restoredLastBodyContent = oldVal;
                        MessageModalFactory.alert(gettextCatalog.getString('mail.writeform~~(첨부 포함) 최대 {{mimeSizeLimit}}까지 입력할 수 있습니다.~~', {mimeSizeLimit: bytesFormatFilter(mimeSizeLimit, 0)}));
                    }
                });
            });

            WriteFormShare.flow().on('filesAdded', function (addFlowFiles, event) {
                var maxFileSizeInAddedFiles = _.max(_.map(addFlowFiles, 'size')),
                    sumAllUploadFileListSize = _.sum(_.map(addFlowFiles, 'size'));


                //파일 업로드 방법이 button click or drop 시 element.data('urlpostfix')에서 데이터를 추출하여 flows.opts 에 할당
                WriteFormShare.flow().opts.urlPostfix = angular.element(event.currentTarget).data('urlpostfix') || '';

                //대용량 첨부일때에만 조건 반영
                if (_isBigFileFlowUploadTarget(WriteFormShare.flow())) {
                    var maxBigFileLimitSize = getMailAttachmentSettings().bigfile.fileSizeLimit;
                    var maxBigFileTotalSize = getMailAttachmentSettings().bigfile.fileTotalSizePerMailLimit;
                    var maxBigFileTotalCount = getMailAttachmentSettings().bigfile.fileCountPerMailLimit;

                    //대용량 첨부 기능 비활성화 시 전송 불가
                    if (!getMailAttachmentSettings().enableBigfile) {
                        return false;
                    }

                    //한번에 업로드할 수 있는 대용량 파일 크기 제한
                    if (maxFileSizeInAddedFiles > maxBigFileLimitSize) {
                        MessageModalFactory.alert(gettextCatalog.getString('mail.writeform~~대용량 첨부 시 개별 파일 용량은 최대 {{maxLimitSize}}까지 가능합니다.~~', {maxLimitSize: bytesFormatFilter(maxBigFileLimitSize, 0)}));
                        return false;
                    }

                    //메일에 업로드 될 수 있는 대용량 파일 개수 제한
                    if (addFlowFiles.length + getBigFileList().length > maxBigFileTotalCount) {
                        MessageModalFactory.alert(gettextCatalog.getString('mail.writeform~~대용량 첨부는 최대 {{maxTotalCount}}개 까지 가능합니다.~~', {maxTotalCount: maxBigFileTotalCount}));
                        return false;
                    }

                    //메일에 업로드 될 수 있는 대용량 파일 크기 제한 (기존 대용량 파일목록 전체 크기 + 신규 파일 전체 크기가 테넌트의 대용량 메일 설정의 크기를 넘어가면 안됨)
                    if (sumAllUploadFileListSize + sumFileSizeByFileList(getBigFileList()) > maxBigFileTotalSize) {
                        MessageModalFactory.alert(gettextCatalog.getString('mail.writeform~~대용량 첨부는 최대 {{maxTotalSize}}까지 가능합니다.~~', {maxTotalSize: bytesFormatFilter(maxBigFileTotalSize, 0)}));
                        return false;
                    }
                    _scrollLastItem();
                    return; //pass uploading bigfile when return undefined
                }

                //일반 첨부일때에만 조건 반영
                var mimeSizeLimit = getMailAttachmentSettings().mimeSizeLimit;
                var allContentsSize = sumTotalMimeSize();
                allContentsSize += sumAllUploadFileListSize;
                allContentsSize += _.sum(_.map(WriteFormShare.flow().files, 'size'));

                if (allContentsSize > mimeSizeLimit) {
                    MessageModalFactory.alert(gettextCatalog.getString('mail.writeform~~파일 첨부는 최대 {{mimeSizeLimit}}까지 가능합니다.~~', {mimeSizeLimit: bytesFormatFilter(mimeSizeLimit, 0)}));
                    return false;
                }
                _scrollLastItem();
            });

            return false;
        };

        function getMailAttachmentSettings() {
            return MailAttachmentSettingsRepository.getContent().value;
        }

        function getRetentionDayGuideInFileList() {
            return moment().add(getMailAttachmentSettings().bigfile.retentionPeriodDays, 'days').format('YYYY.MM.DD');
        }

        function getBigFileList() {
            return _.filter(form.fileList, function (file) {
                return !_.isEmpty(file.id);
            });
        }

        function getMimeFileList() {
            return _.filter(form.fileList, function (file) {
                return _.isNumber(file.partNumber);
            });
        }

        function sumFileSizeByFileList(fileList) {
            return _.sum(_.map(fileList, function (file) {
                return file.size * 1;
            }));
        }

        //대용량첨부 - 전체 파일목록에서 file.id property가 존재한 목록의 전체 크기
        function sumBigFileListSize() {
            return sumFileSizeByFileList(getBigFileList());
        }

        //일반첨부 - 마임에 추가된 파일목록 전체 크기 + 신규 파일 전체 크기가 20MB를 넘어가면 안됨 ( 제목 + 본문 크기로 인해 20MB 오버 시 서버오류로 처리 )
        function sumTotalMimeSize() {
            return sumFileSizeByFileList(getMimeFileList());
        }

        function getBigFileUploadTargetPostfix() {
            return '?bigfile=true';
        }

        function onRemovedFiles() {
            MailDraftFileAction.fetch($scope.form.id).then(function (res) {
                WriteFormShare.submitForm().withForm({
                    fileList: res.contents()
                });
            });
        }

        function changeSignature(data) {
            var matchCount = 0,
                signature = MailSignatureUtil.wrapPositionComments(data.content),
                replacedContent = $scope.form.body.content.replace(MailSignatureUtil.MATCH_REGEX, function () {
                    matchCount++;
                    return signature;
                });

            if (matchCount) {
                $scope.form.body.content = replacedContent;
                return;
            }
            $scope.editor.html.set('<br/><br/>' + signature);
        }

        function _init() {
            _getSignatureInfoPromise().then(function (info) {
                $scope.signatures = info.signatures;
                $scope.signatureContent = $scope.option.signature;
            });
        }

        function _getSignatureInfoPromise() {
            if (!_.isEmpty(MailSignatureRepository.getContent())) {
                return $q.when(MailSignatureRepository.getContent());
            }
            return MailSignatureRepository.fetchAndCache().then(function () {
                return MailSignatureRepository.getContent();
            });
        }

        //API URL POSTFIX로 대용량 첨부 업로드인지 확인 ng-click시 target 동적으로 변경됨
        function _isBigFileFlowUploadTarget(flow) {
            return flow.opts.urlPostfix === getBigFileUploadTargetPostfix();
        }

        //FIXME WriteformLayout에서의 코드와 중복됨
        function _scrollLastItem() {
            $timeout(function () {
                var elLastItem = $element.find('mail-attached-file-list li:last')[0];
                if (elLastItem) {
                    elLastItem.scrollIntoView();
                }
            }, 0, false);
        }
    }

    /* @ngInject */
    function MailWriteformFragmentsHeadCtrl($q, $scope,
                                            MailSecuritySettingsRepository,
                                            MailWriteformBiz, EmailAddressClassifyBiz,
                                            MessageModalFactory,
                                            HelperAddressUtil, MailItemSecurityUtil,
                                            WriteFormShare, TagInputMailHelper,
                                            MailDistributionListBiz, MemberMeEmailAddresses,
                                            gettextCatalog, addressparser, _) {
        $scope.memberMeEmailList = [];
        $scope.ui.uiSelect = {
            searchUsers: []
        };

        $scope.ui.uiSelect = _.cloneDeep(WriteFormShare.submitForm().option('users'));
        $scope.isEnableSecuritySettings = isEnableSecuritySettings;

        $scope.securitySelectOptions = [
            {name: gettextCatalog.getString('mail.writeform~~1일 후~~'), value: 1},
            {name: gettextCatalog.getString('mail.writeform~~7일 후~~'), value: 7},
            {name: gettextCatalog.getString('mail.writeform~~30일 후~~'), value: 30},
            {name: gettextCatalog.getString('mail.writeform~~90일 후~~'), value: 90}
        ];

        $scope.searchMember = function (query) {
            TagInputMailHelper.queryMemberOrDl(query).then(function (result) {
                $scope.ui.uiSelect.searchUsers = result;
            });
        };

        $scope.onSelect = function ($item) {
            if ($item.type === 'distributionList') {
                $item.distributionList.members = [];
                MailDistributionListBiz.fetch($item.distributionList.id).then(function (result) {
                    $item.distributionList.distributionItemList = result.contents().distributionItemList;
                    $item.distributionList.allMemberTooltip = _(result.contents().distributionItemList).map(function (memberWrapper) {
                        var member = memberWrapper[memberWrapper.type];
                        return HelperAddressUtil.makeDisplayInMail(member.name, member.emailAddress);
                    }).value().join(', ');
                });
            }
        };

        $scope.filterUser = function (searchItem, tagItem) {
            if (!searchItem || !tagItem) {
                return false;
            }
            var searchMailItem = _.get(searchItem[searchItem.type], 'emailAddress'),
            //TODO: beta api에서 적용안된 레거시코드 때문에
                tagMailItem = _.get(tagItem[tagItem.type], 'email') || _.get(tagItem[tagItem.type], 'emailAddress');

            return searchMailItem === tagMailItem;
        };

        $scope.allowTag = TagInputMailHelper.allowEmailUser;

        //$scope.$watch(function () {
        //    return WriteFormShare.submitForm().option('users');
        //}, function (newVal) {
        //    $scope.users = newVal;
        //});

        //form 형태로 되돌려줌
        $scope.$watch('ui.uiSelect.to', function (newVal) {
            _replaceEmailObjectByInputModel(newVal);
            $scope.form.users.to = TagInputMailHelper.toEmailFormFromMailDetailUser(newVal);
            //console.log('ui.uiSelect.to', newVal, $scope.form.users.to);
        }, true);

        $scope.$watch('ui.uiSelect.cc', function (newVal) {
            _replaceEmailObjectByInputModel(newVal);
            $scope.form.users.cc = TagInputMailHelper.toEmailFormFromMailDetailUser(newVal);
            //console.log('ui.uiSelect.cc', newVal, $scope.form.users.cc);
        }, true);


        //tag-input-mail.match.tpl.html에서 emailUser 일때 사용자 편집으로 _inputModel이 변경되었을 경우 ui.uiSelect 및 form.users에 반영하도록 함
        function _replaceEmailObjectByInputModel(emailObjectList) {
            _.forEach(emailObjectList, function (emailObject) {
                var inputModel = _.get(emailObject[emailObject.type], '_inputModel');
                if (inputModel) {
                    var parsedMail = addressparser.parse(inputModel)[0];
                    if (parsedMail.name !== emailObject[emailObject.type].name ||
                        parsedMail.address !== emailObject[emailObject.type].emailAddress) {
                        emailObject[emailObject.type].name = parsedMail.name;
                        emailObject[emailObject.type].emailAddress = parsedMail.address;
                    }
                }
            });
        }

        $scope.extractGroupToItems = function (list, removeTarget, replaceModels, onFinish) {
            var replaceEmails = _(replaceModels).map(function (memberWrapper) {
                return memberWrapper[memberWrapper.type].emailAddress;
            }).value();

            EmailAddressClassifyBiz.query(replaceEmails).then(function (result) {
                var userMap = result.result(),
                    replaceTargets = [];

                _.forEach(replaceEmails, function (email) {
                    var existEmail = _.find(list, function (member) {
                        return member[member.type].emailAddress === email;
                    });
                    if (existEmail) {
                        return;
                    }
                    replaceTargets.push(userMap[email]);
                    if (userMap[email].type === 'distributionList') {
                        MailDistributionListBiz.fetch(userMap[email].distributionList.id).then(function (result) {
                            userMap[email].distributionList.distributionItemList = result.contents().distributionItemList;
                            userMap[email].distributionList.allMemberTooltip = _(result.contents().distributionItemList).map(function (memberWrapper) {
                                var member = memberWrapper[memberWrapper.type];
                                return HelperAddressUtil.makeDisplayInMail(member.name, member.emailAddress);
                            }).value().join(', ');
                        });
                    }
                });
                replaceTargets.unshift(_.findIndex(list, removeTarget), 1);
                list.splice.apply(list, replaceTargets);

                onFinish();
            });
        };

        function isEnableSecuritySettings() {
            return _.get(MailSecuritySettingsRepository.getContent().value, 'use');
        }

        //보안 메일 사용 여부
        MailSecuritySettingsRepository.fetchAndCache();


        ////입력된 데이터가 자동완성과 매칭되고 타입이 mailid 이면 추가 멤버 정보를 요청함
        //$scope.assignMailDlMembersToTagObject = function (tagObject) {
        //    var mailDlTypeItem = _.result(tagObject, 'getItem');
        //    if (!mailDlTypeItem || mailDlTypeItem.type !== 'maildl') {
        //        return;
        //    }
        //
        //    MailDistributionListBiz.fetch(mailDlTypeItem.id).then(function (result) {
        //        if (!$scope.allMemberOrMailDlEmailMap) {
        //            mailDlTypeItem.members = result.members;
        //            return;
        //        }
        //        mailDlTypeItem.members = [];
        //        _.forEach(result.members, function (member) {
        //            mailDlTypeItem.members.push($scope.allMemberOrMailDlEmailMap[member.emailAddress] || member);
        //        });
        //    });
        //};

        //나의 이메일 목록을 받음과 동시에 default flag 여부에 따라 기본값 설정함
        MemberMeEmailAddresses.fetchListWithConfirmStatus().then(function (results) {
            $scope.memberMeEmailList.length = 0;
            $scope.memberMeEmailList = $scope.memberMeEmailList.concat(_.map(results.contents(), function (emailAddress) {
                emailAddress.displayName = HelperAddressUtil.makeDisplayInMail(emailAddress.displayName, emailAddress.emailAddress);
                return emailAddress;
            }));
        });

        MailWriteformBiz.addValidationPromise(function () {
            var submitForm = WriteFormShare.submitForm();
            //답장/전체 답장에서 전달 금지된 메일은 원본 FROM/TO/CC에 속하지 않는 emailUser의 emailAddress가 있으면 에러 표시 후 해당 멤버를 제거함
            if (!MailItemSecurityUtil.isNormal(submitForm.form('security.level')) &&
                submitForm.form('relation.type') === 'reply' && !submitForm.form('security.resend')) {


                var fromEmailAddress = _extractEmailAddressFromUser(submitForm.form('users.from')),
                    toEmailAddressList = _.map($scope.ui.uiSelect.to, _extractEmailAddressFromUser),
                    ccEmailAddressList = _.map($scope.ui.uiSelect.cc, _extractEmailAddressFromUser),
                    fromEmailAddressOrigin = _extractEmailAddressFromUser(submitForm.option('usersFrom')),
                    toEmailAddressOriginList = _.map(submitForm.option('users.to'), _extractEmailAddressFromUser),
                    ccEmailAddressOriginList = _.map(submitForm.option('users.cc'), _extractEmailAddressFromUser);

                //1. FROM은 무조건 동일한 emailaddress 여야함
                //2. TO/CC는 기존 emailaddress 내에 포함되어야 하며 그 외에너느 허용하지 않음
                var invalidList = [];
                var fromEmailAddressIsEqual = _.isEqual(fromEmailAddress, fromEmailAddressOrigin),
                    toDiffEmailAddressMap = _(toEmailAddressList).difference(toEmailAddressOriginList).mapKeys().value(),
                    ccDiffEmailAddressMap = _(ccEmailAddressList).difference(ccEmailAddressOriginList).mapKeys().value();

                if (!fromEmailAddressIsEqual) {
                    submitForm.withForm('users.from', _.cloneDeep(submitForm.option('usersFrom')));
                    invalidList.push(_createErrorObject('from'));
                }

                if (_.size(toDiffEmailAddressMap) > 0) {
                    $scope.ui.uiSelect.to = _.filter($scope.ui.uiSelect.to, function (user) {
                        return !toDiffEmailAddressMap[_extractEmailAddressFromUser(user)];
                    });
                    $scope.form.users.to = TagInputMailHelper.toEmailFormFromMailDetailUser($scope.ui.uiSelect.to);
                    invalidList.push(_createErrorObject('to'));
                }

                if (_.size(ccDiffEmailAddressMap) > 0) {
                    $scope.ui.uiSelect.cc = _.filter($scope.ui.uiSelect.cc, function (user) {
                        return !ccDiffEmailAddressMap[_extractEmailAddressFromUser(user)];
                    });
                    $scope.form.users.cc = TagInputMailHelper.toEmailFormFromMailDetailUser($scope.ui.uiSelect.cc);
                    invalidList.push(_createErrorObject('cc'));
                }

                return invalidList.length > 0 ? $q.reject(invalidList) : $q.when();
            }
            return $q.when();

            function _createErrorObject(key) {
                return {
                    key: key,
                    msg: gettextCatalog.getString('mail.writeform~~전달 금지된 메일은 해당 메일의 From/To/Cc만 수신인에 추가할 수 있습니다.~~')
                };
            }
        });


        function _extractEmailAddressFromUser(user) {
            return user[user.type].emailAddress;
        }


        MailWriteformBiz.addValidationPromise(function () {
            var submitForm = WriteFormShare.submitForm();
            //보안레벨이 설정된 메일이면 내부사용자 메일만 보낼수 있도록 validation 처리에 추가함
            if (!MailItemSecurityUtil.isNormal(submitForm.form('security.level'))) {
                var emailAddressList = _(submitForm.form('users.to')).concat(submitForm.form('users.cc')).map(function (value) {
                    return value[value.type].emailAddress;
                }).value();
                return EmailAddressClassifyBiz.query(emailAddressList).then(function (result) {
                    var emailAddressMap = result.result();
                    var emailUserList = _(emailAddressMap).values().filter({type: 'emailUser'}).value();
                    if (emailUserList.length) {
                        return MessageModalFactory.confirm(
                            gettextCatalog.getString('mail.writeform~~대외비/기밀 메일은 외부 계정으로 발송이 제한되어 있습니다. <br>수신 주소에 포함된 외부 계정({{emailUserCount}}개)을 제외하고 발송하시겠습니까?~~', {
                                emailUserCount: emailUserList.length
                            }),
                            gettextCatalog.getString('mail.writeform~~보안 메일~~'), {
                                focusToCancel: true,
                                confirmBtnLabel: gettextCatalog.getString('mail.writeform~~제외 후 발송~~'),
                                cancelBtnLabel: gettextCatalog.getString('mail.writeform~~취소~~')
                            }).result.then(function () {
                                //emailUser는 ui.select 및  form.users to cc 목록에서 제거함
                                $scope.ui.uiSelect.to = _.filter($scope.ui.uiSelect.to, function (user) {
                                    return emailAddressMap[user[user.type].emailAddress].type !== 'emailUser';
                                });
                                $scope.ui.uiSelect.cc = _.filter($scope.ui.uiSelect.cc, function (user) {
                                    return emailAddressMap[user[user.type].emailAddress].type !== 'emailUser';
                                });

                                $scope.form.users.to = TagInputMailHelper.toEmailFormFromMailDetailUser($scope.ui.uiSelect.to);
                                $scope.form.users.cc = TagInputMailHelper.toEmailFormFromMailDetailUser($scope.ui.uiSelect.cc);
                                var invalidList = WriteFormShare.submitForm().validateForm();
                                return (invalidList.length > 0) ? $q.reject(invalidList) : $q.when();
                            });
                    }
                });
            }
            return $q.when();
        });

        //////all org member-group and org member for to,cc typeahead item list
        //DoorayTagInputForItemList.queryAllOrgMemberAndMailDistributionList().then(function (contents) {
        //    $scope.allMemberOrMailDlList = contents;
        //    $scope.allMemberOrMailDlEmailMap = _.keyBy(contents, 'email');
        //});
    }

    /* @ngInject */
    function MailWriteformFragmentsBodyCtrl() {

    }

})();
