(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('simpleMailWriteform', {
            templateUrl: 'modules/mail/legacy/writeform/simpleMailWriteform/simpleMailWriteform.html',
            controller: SimpleMailWriteform,
            bindings: {
                mail: '<',
                type: '@',
                onSubmit: '&',
                closeModal: '&'
            }
        });

    /* @ngInject */
    function SimpleMailWriteform($q, $scope, $element, $timeout, MIME_TYPE,
                                 DateConvertUtil, EmailAddressClassifyBiz, HelperAddressUtil, HelperPromiseUtil, MailDistributionListBiz, MailSignatureRepository, MailSignatureUtil, MailSubmitFormRouterFactory, MailWriteformBiz, MessageModalFactory, TagInputMailHelper, WriteFormShare, deviceDetector, gettextCatalog, _) {
        var $ctrl = this,
            submitPromise,
            unwatchFuncs = [];

        this.ui = {
            searchUsers: []
        };
        $scope._ = _;
        $scope.extractGroupToItems = extractGroupToItems;

        this.allowTag = TagInputMailHelper.allowEmailUser;
        this.filterUser = filterUser;
        this.onSelect = onSelect;
        this.searchMember = searchMember;
        this.onLoadEditor = onLoadEditor;
        this.submit = submit;
        this.submitDraft = _.debounce(submitDraft, 100);
        this.changeSignature = changeSignature;

        var _debounceSubmitDraft = _.debounce(submitDraft, 1000);

        _init();


        function extractGroupToItems(list, removeTarget, replaceModels, onFinish) {
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
        }

        function filterUser(searchItem, tagItem) {
            if (!searchItem || !tagItem) {
                return false;
            }
            var searchMailItem = _.get(searchItem[searchItem.type], 'emailAddress'),
            //TODO: beta api에서 적용안된 레거시코드 때문에
                tagMailItem = _.get(tagItem[tagItem.type], 'email') || _.get(tagItem[tagItem.type], 'emailAddress');

            return searchMailItem === tagMailItem;
        }

        function onSelect($item) {
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
        }

        function searchMember(query) {
            TagInputMailHelper.queryMemberOrDl(query).then(function (result) {
                $ctrl.ui.searchUsers = result;
            });
        }

        function onLoadEditor(editor) {
            $ctrl.editor = editor;
            //TODO 에디터에 값을 최초 설정할때 form.body.content 데이터와 에디터 삽입후의 데이터가 변경되므로 submitForm.isFormModified() 조건 초기화
            WriteFormShare.submitForm().withForm('body.content', $ctrl.form.body.content).resetFormModified();

            var TOTAL_CONTENTS_SIZE = 15 * 1024 * 1024;
            var restoredLastBodyContent;

            $timeout(function () {
                tinyMCE.execCommand('focus');
            }, 200, false);

            unwatchFuncs.push($scope.$watch('$ctrl.form.body.content', function (newVal, oldVal) {
                if (newVal === restoredLastBodyContent) {    //신규로 입력된 본문이 복원된 내용과 동일하면 무시함
                    return;
                }
                var allContentsSize = calculateAlreadyFormContentSize();
                if (allContentsSize > TOTAL_CONTENTS_SIZE) {
                    _.set($ctrl.form, 'body', {
                        content: oldVal,
                        mimeType: MIME_TYPE.HTML.type
                    });
                    restoredLastBodyContent = oldVal;
                    MessageModalFactory.alert(gettextCatalog.getString('(첨부 포함) 최대 20MB까지 입력할 수 있습니다.'));
                }
                if (newVal !== oldVal) {
                    _debounceSubmitDraft();
                }
            }));

            //본문 + 기존 파일목록 전체 크기 + 신규 파일 전체 크기가 20MB를 넘어가면 안됨
            function calculateAlreadyFormContentSize() {
                return _.get($ctrl.form, 'subject.length', 0) +
                    _.get($ctrl.form, 'body.content.length', 0);
            }
        }

        function submit() {
            MailWriteformBiz.validateBeforeSubmitPromise().then(function () {
                if (HelperPromiseUtil.isResourcePending(submitPromise)) {
                    return;
                }
                _.forEach(unwatchFuncs, function (func) {
                    func();
                });
                $ctrl.submitDraft.cancel();
                _debounceSubmitDraft.cancel();
                WriteFormShare.submitForm().submit().then(function () {
                    $ctrl.onSubmit();
                });
            });
        }

        function changeSignature(data) {
            var matchCount = 0,
                signature = MailSignatureUtil.wrapPositionComments(data.content),
                replacedContent = $ctrl.form.body.content.replace(MailSignatureUtil.MATCH_REGEX, function () {
                    matchCount++;
                    return signature;
                });

            if (matchCount) {
                $ctrl.form.body.content = replacedContent;
                return;
            }
            $ctrl.editor.insertContent('<br/><br/>' + signature);
        }

        function _init() {
            // 스트림에서 iterporation=true를 사용하기 위해 reply, replyall, forward 시에 id를 넘김
            MailSubmitFormRouterFactory[$ctrl.type]($ctrl.mail.id).then(function (submitForm) {
                WriteFormShare.submitForm(submitForm);
                WriteFormShare.biz(MailWriteformBiz);
                WriteFormShare.flow(MailWriteformBiz.getTempFileBiz().createFlow());

                $ctrl.form = WriteFormShare.submitForm().form();
                $ctrl.option = WriteFormShare.submitForm().form();
                $ctrl.mode = WriteFormShare.mode();
                _safariFlexBugPolyfill();
                _.assign($ctrl.ui, submitForm.option('users'));

                _getSignatureInfoPromise().then(function (info) {
                    $ctrl.signatures = info.signatures;
                    $ctrl.signatureContent = $ctrl.option.signature;
                });

                unwatchFuncs.push($scope.$watchCollection('$ctrl.ui.to', function (newVal, oldVal) {
                    $ctrl.form.users.to = TagInputMailHelper.toEmailFormFromMailDetailUser(newVal);
                    if (!_.isEqual(newVal, oldVal)) {
                        _debounceSubmitDraft();
                    }
                }));
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

        function _safariFlexBugPolyfill() {
            //TODO: safari의 flex height 버그가 해결 될 때 까지 임시코드
            if (deviceDetector.isDesktop() && deviceDetector.browser === 'safari') {
                $scope.$watch(function () {
                    return $element.find('.te-editor-section').height();
                }, function (newVal) {
                    $element.find('.tui-editor').height(newVal);
                });

                $scope.$watch(function () {
                    return $element.find('.mce-container-body').height();
                }, function (newVal) {
                    $element.find('.mce-edit-area').height(newVal - 71);
                });
            }
        }

        function submitDraft() {
            var submitForm = WriteFormShare.submitForm();
            $ctrl.ui.saveInfo = gettextCatalog.getString('업로드 중');
            if (HelperPromiseUtil.isResourcePending(submitPromise)) {
                return submitPromise;
            }
            submitPromise = submitForm.submitDraft().then(function (result) {
                $ctrl.ui.saveInfo = gettextCatalog.getString('{{datetime}}에 저장됨', {datetime: DateConvertUtil.parseDateTimeObjectFromNow({time: 'HH:mm'}).time});
                submitForm.resetFormModified();
                return result;
            }, function () {
                $ctrl.ui.saveInfo = gettextCatalog.getString('업로드 오류');
            });
            return submitPromise;
        }

        $scope.$on('modal.closing', function ($event, resultOrReason, isClosed) {
            if (isClosed || _.isUndefined(resultOrReason)) {
                return;
            }
            if ($ctrl.ui.saveInfo) {
                $event.preventDefault();
                var msg = [
                    '<p>', gettextCatalog.getString('이 페이지를 나가면 입력된 내용이 저장되지 않습니다.'), '</p>' +
                    '<p>', gettextCatalog.getString('페이지를 나가시겠습니까?'), '</p>'
                ].join('');
                MessageModalFactory.confirm(msg, '', {
                    confirmBtnLabel: gettextCatalog.getString('네'),
                    cancelBtnLabel: gettextCatalog.getString('아니오')
                }).result.then(function () {
                        $ctrl.closeModal();
                    });
            }
        });
    }

})();
