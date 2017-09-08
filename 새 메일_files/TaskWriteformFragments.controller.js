(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .controller('TaskWriteformEditorCtrl', TaskWriteformEditorCtrl)
        .controller('TaskWriteformFragmentsHeadCtrl', TaskWriteformFragmentsHeadCtrl)
        .controller('TaskWriteformFragmentsBodyCtrl', TaskWriteformFragmentsBodyCtrl);

    /* @ngInject */
    function TaskWriteformFragmentsHeadCtrl($q, $scope, $stateParams, $timeout, $window, CheckDuplicatedUtil, DueDateService, HelperConfigUtil, HelperPromiseUtil, MessageModalFactory, MilestoneBiz, PopupUtil, Project, ProjectManagementModalFactory, RootScopeEventBindHelper, TagBiz, TaskTemplateApiBiz, TaskWriteformBiz, TaskTemplateSubmitFormFactory, WriteFormShare, gettextCatalog, moment, TagInputTaskHelper, TagInputMailHelper, _) {
        $scope.ui.memberProjects = [];
        $scope.ui.projects = [];
        $scope.ui.tags = null;  //isteven multi selector에서 null이거나 undefined가 아니면 최초에 $scope.form.tagIdList 가 빈배열로 초기화되는 문제 우회처리
        $scope.ui.selectedTagList = [];
        $scope.ui.isOpenTagsPane = false;
        $scope.ui.milestones = [];
        $scope.ui.milestonesFilterRule = MilestoneBiz.getMilestoneTabFilterRule('open');
        $scope.ui.openMilestoneTapIndex = 0;
        $scope.ui.templates = [];
        $scope.ui.canSettingProject = false;
        $scope.ui.uiSelect = {};
        $scope.ui.uiSelect.searchUsers = [];

        $scope.mode.isSubPost = WriteFormShare.type().isTask && WriteFormShare.submitForm().isSubPost();
        $scope.mode.workflowClass = WriteFormShare.submitForm().option('workflowClass');
        $scope.isSelectedProjectNone = function () {
            return !isNotPrivateProjectCode($scope.form.projectCode);
        };
        $scope.draftAction.setRemoveConfirmMsg(gettextCatalog.getString('임시 저장된 업무를 삭제하시겠습니까?'));

        var MY_PROJECT_CODE = HelperConfigUtil.myProjectItem().code;
        // 새업무/새메시지 인경우 현재 선택된 테스크의 프로젝트 코드(개인 업무/메시지 - @{{USERCODE}}포함)를 기본 선택하도록 함
        $scope.form.projectCode = $scope.form.projectCode || $stateParams.projectCode || MY_PROJECT_CODE;
        _.assign($scope.ui.uiSelect, WriteFormShare.submitForm().option('users'));

        $scope.searchMember = function (query){
            TagInputTaskHelper.queryMemberOrGroup(query, {
                boost: {
                    projectCode : $scope.form.projectCode
                }
            }).then(function(result){
                $scope.ui.uiSelect.searchUsers = result;
            });
        };

        $scope.onSelect = function($item) {
            if($item.type === 'group') {
                $item.group.members = [];
                TagInputTaskHelper.queryProjectMember($item.group).then(function(result){
                    $item.group.members = result;
                });
            }
        };

        $scope.filterUser = function(item, listItem) {
            if(!item || !listItem) {
                return false;
            } else if (item.type === 'emailUser') {
                return _.get(item, 'emailUser.emailAddress') === _.get(listItem, 'emailUser.emailAddress');
            }
            return _.get(item[item.type], 'id') === _.get(listItem[listItem.type], 'id');
        };

        $scope.allowTag = TagInputMailHelper.allowEmailUser;

        $scope.$watch(function () {
            return WriteFormShare.submitForm().option('users');
        }, function() {
            _.assign($scope.ui.uiSelect, WriteFormShare.submitForm().option('users'));
        });

        //form 형태로 되돌려줌
        $scope.$watchCollection('ui.uiSelect.to', function (newVal) {
            $scope.form.users.to = TagInputTaskHelper.toMemberOrGroupFromTaskDetailUser(newVal);
        });
        $scope.$watchCollection('ui.uiSelect.cc', function (newVal) {
            $scope.form.users.cc = TagInputTaskHelper.toMemberOrGroupFromTaskDetailUser(newVal);
        });



        var projectListPromise;

        function asyncProjectList() {
            if (HelperPromiseUtil.isResourcePending(projectListPromise)) {
                return projectListPromise;
            }
            var submitFormOptions = WriteFormShare.submitForm().option(),
                organizationId = $scope.mode.isUpdate ? submitFormOptions.organizationId : null;

            projectListPromise = $q.all([Project.fetchMyActiveList(organizationId), Project.fetchActivePublicList(organizationId)]).then(function (results) {
                $scope.ui.memberProjects = results[0].contents();

                //개인코드는 처음 신규로 작성시 존재하지 않거나 드레프트중인 테스크 혹은 수정중인 경우 user.from.member.id가 존재할 경우에 프로젝트 목록 처음 위치에 추가
                var fromUserId = _.get(submitFormOptions, 'users.from.member.organizationMemberId');
                if (!fromUserId || fromUserId === HelperConfigUtil.orgMemberId()) {
                    $scope.ui.memberProjects.unshift(HelperConfigUtil.myProjectItem());
                }

                $scope.ui.projects = _($scope.ui.memberProjects).concat(results[1].contents()).uniqBy('code').map(function (project) {
                    var refMap = _.get(project, '_wrap.refMap');
                    project._name = project._name || project.code;  // project._name 은 HelperConfigUtil.myProjectItem()에서 있어서 예외처리
                    project._organizationName = refMap ? _.get(refMap.organizationMap(project.organizationId), 'name') : null;
                    return project;
                }).value();

                //하위테스크와 같이 프로젝트 정보가 API 응답으로 넘어왔을 때 내 프로젝트 목록에 없을 경우 목록에 추가
                var formProjectCode = _.get(submitFormOptions, 'project.code', '');
                if (formProjectCode && ($scope.mode.isSubPost || $scope.mode.isUpdate)) {
                    var containsFormProjectInMyProjectList = !!_.find($scope.ui.projects, function (project) {
                        return project.code === formProjectCode;
                    });
                    //inject after @privateCode or first, not contain projectCode list and not equal to userCode
                    if (!containsFormProjectInMyProjectList && formProjectCode !== MY_PROJECT_CODE) {
                        $scope.ui.projects.unshift(_.assign({_name: formProjectCode}, submitFormOptions.project));
                    }
                }
                $scope.ui.searchTargetProjects = $scope.ui.projects;
            });
            return projectListPromise;
        }

        function assignAdjustProjectCodeWhenDraftMode() {
            //하위 신규 테스크인 경우 내 프로젝트 목록에 없는 코드(다른 사용자의 개인 코드)가 설정될 수 있으므로 하위가 아닌 경우에 내 프로젝트 목록 + PUBLIC 목록에 있는 프로젝트 코드인지 확인
            if (!$scope.mode.isSubPost && !CheckDuplicatedUtil.byString($scope.ui.projects, 'code', $scope.form.projectCode)) {
                //파라미터 값을 참고하여 최종 설정 : 설정된 프로젝트 코드가 undefined(쓰기창 복원시 TaskDetail 로딩안됨)이거나 내 목록에 없는 코드 그리고 최종 내 프로젝트 코드를 빈값으로 찾을 수 없으면 빈 값으로 설정
                $scope.form.projectCode = CheckDuplicatedUtil.byString($scope.ui.projects, 'code', $stateParams.projectCode) ?
                    $stateParams.projectCode : CheckDuplicatedUtil.byString($scope.ui.projects, 'code', MY_PROJECT_CODE) ? MY_PROJECT_CODE : '';
            }
        }

        var projectListPromise = asyncProjectList().then(assignAdjustProjectCodeWhenDraftMode);

        function fetchTags(projectCode, submitFormOptions) {
            $scope.ui.tags = null;

            return TagBiz.getTagsForMultiSelect(projectCode, submitFormOptions.tagIdList).then(function (tags) {
                //$scope.ui.selectedTagList 업데이트는 isteven-multi-select에 의해 자체적으로 이루어짐
                $scope.ui.tags = tags;
                return tags;
            });
        }

        function fetchMilestone(projectCode, submitFormOptions) {
            $scope.ui.milestones = [];

            return MilestoneBiz.getMilestonesForDropdown(projectCode).then(function (result) {
                $scope.ui.milestones = result.contents();

                //프로젝트에 따른 마일스톤 목록을 불러왔을때 기존 마일스톤 정보가 포함되지 않을경우 초기화
                if (_.get($scope.form, 'milestoneId') && !CheckDuplicatedUtil.byString($scope.ui.milestones, 'id', $scope.form.milestoneId)) {
                    $scope.milestoneId = null;
                }
                if (_.get(submitFormOptions, 'project.code') === projectCode) {
                    var milestoneId = _.get(submitFormOptions, 'milestoneId');
                    $scope.form.milestoneId = milestoneId || null;
                }

                return $scope.ui.milestones;
            });
        }

        function fetchTemplates(projectCode) {
            $scope.ui.templates = [];

            return TaskTemplateApiBiz.query(projectCode).then(function (result) {
                var datas = _.map(result.contents(), function (content) {
                    return {
                        templateName: content.templateName,
                        id: content.id,
                        isDefault: content.isDefault
                    };
                });
                datas.unshift({templateName: gettextCatalog.getString('없음'), id: null});
                return $q.when(datas);
            }).then(function (templates) {
                $scope.ui.templates = templates;
                return templates;
            });
        }

        function isNotPrivateProjectCode(projectCode) {
            return projectCode && projectCode.indexOf('@') < 0;
        }

        function resetTags() {
            PopupUtil.resetBizCacheInOpenerWindow('TagBiz');
            if (isNotPrivateProjectCode($scope.form.projectCode)) {
                fetchTags($scope.form.projectCode, {
                    tagIdList: _.get($scope.form, 'tagIdList')
                });
            }
        }

        function resetMilestones() {
            PopupUtil.resetBizCacheInOpenerWindow('MilestoneBiz');
            if (isNotPrivateProjectCode($scope.form.projectCode)) {
                fetchMilestone($scope.form.projectCode, {
                    project: {code: $scope.form.projectCode},
                    milestoneId: _.get($scope.form, 'milestoneId')
                });
            }
        }

        function resetTaskTemplates() {
            PopupUtil.resetBizCacheInOpenerWindow('TaskTemplateApiBiz');
            if (isNotPrivateProjectCode($scope.form.projectCode)) {
                fetchTemplates($scope.form.projectCode, {
                    project: {code: $scope.form.projectCode},
                    templateId: _.get($scope.form, 'template.id')
                });
            }
        }

        //드레프트 이어쓰기에서 최초 로딩 시 템플릿을 적용하지 않고 이후에 프로젝트 코드나 템플릿 변경 시 기본 템플릿 적용하도록 함
        var ignoreApplyTemplateOnceFromTempSave;
        $scope.$watch('form.projectCode', function (newVal, oldVal) {
            if (!isNotPrivateProjectCode(newVal)) {
                $scope.ui.loading = false;
                return;
            }

            Project.fetchByCode(newVal, Project.PARAM_NAMES.EXT_FIELDS.MEMBERS).then(function (result) {
                $scope.ui.canSettingProject = _.find(result.contents().projectMemberList, {'organizationMemberId': HelperConfigUtil.orgMemberId()});
            });

            // 기존의 projectCode와 같으면 tag와 milestone을 선택된 값으로 설정함
            var submitFormOptions = WriteFormShare.submitForm().option();
            $q.all([fetchTags(newVal, submitFormOptions), fetchMilestone(newVal, submitFormOptions), fetchTemplates(newVal, submitFormOptions), projectListPromise]).then(function (fetchList) {

                //project.code의 변경 주체가 임시 저장일경우 최초 한번은 템플릿 적용처리 및 기존 설정정보를 무시함
                if (submitFormOptions.fromTempSave && _.isUndefined(ignoreApplyTemplateOnceFromTempSave)) {
                    ignoreApplyTemplateOnceFromTempSave = submitFormOptions.fromTempSave;
                    $scope.ui.loading = false;
                    return;
                }

                //업데이트 모드에서만 원래 tags, milestone, template을 원본값에 맞게 복원하도록 함
                if (!$scope.mode.isUpdate) {
                    submitFormOptions.tagIdList = [];
                    submitFormOptions.milestoneId = null;
                    submitFormOptions.templateId = null;
                }

                var /*tags = fetchList[0], milestones = fetchList[1],*/ templates = fetchList[2];
                if ((!submitFormOptions.needApplyTemplate || newVal !== $scope.form.projectCode) &&
                    (_.isEmpty(oldVal) || _.isEqual(newVal, oldVal))) {
                    $scope.ui.loading = false;
                    return;
                }

                submitFormOptions.needApplyTemplate = false;
                $scope.form.tagIdList = $scope.form.tagIdList || [];  //프로젝트 코드가 변경될경우 기존 태그의 값은 의미가 없어짐
                $scope.form.tagIdList.length = 0;

                if (!_.isEmpty(templates)) {
                    var defaultTemplate = _.find(templates, {'isDefault': true});
                    if (defaultTemplate) {
                        $scope.selectTemplateItem(defaultTemplate);
                    }
                }
            });
        });

        $scope.changeMilestonesFilterRule = function (status) {
            $scope.ui.milestonesFilterRule = MilestoneBiz.getMilestoneTabFilterRule(status);
            $scope.ui.openMilestoneTapIndex = status === 'open' ? 0 : 1;
        };

        //isteven-multi-select output-model이 객체의 배열이므로 순수 id를 form.tagIdList에 반영함
        //form.tagIdList의 값이 변경될경우 버튼 및 체크상태 업데이트 (템플릿 적용이나 임시저장 복원같이 로직으로 업데이트 될 수 있음)
        $scope.$watchCollection('ui.selectedTagList', function (newVal, oldVal) {
            if (_.isEqual(newVal, oldVal)) {
                return;
            }
            $scope.form.tagIdList = _.map(newVal, function (tagObj) {
                return tagObj.id;
            });
        });

        //업무수정 > 임시저장 복원처럼 이후 에 tagIdList가 변경될 수 있으므로 isteven-multi-select에도 재 반영해주도록 함
        $scope.$watchCollection('form.tagIdList', function (newVal, oldVal) {
            if (_.isEqual(newVal, oldVal)) {
                return;
            }
            TagBiz.resetTagsIcon($scope.form.tagIdList, $scope.ui.tags);
        });

        var templatePropertiesForFillForm = ['subject', 'users.to', 'users.cc', 'body.content', 'dueDateFlag', 'milestoneId', 'tagIdList'];

        function isEmptyForm() {
            return _.isEmpty(_.filter(templatePropertiesForFillForm, function (prop) {
                return !_.isEmpty(_.get($scope.form, prop));
            }));
        }

        function _assignTemplateContentToFormProperties(template) {
            var dueDateMoment = template.dueDate && moment(template.dueDate);
            _.set($scope.form, 'dueDate', (dueDateMoment && dueDateMoment.isValid() && dueDateMoment.isBefore(moment())) ?
                 moment().startOf('day').add(1, 'day').format(): template.dueDate);
            _.set($scope.form, 'template.id', template.id);
            _.forEach(templatePropertiesForFillForm, function (prop) {
                _.set($scope.form, prop, _.clone(_.get(template, prop)));
            });
            $scope.form.body = {
                mimeType: _.clone(_.get(template, 'body.mimeType')),
                content: _.clone(_.get(template, 'body.content'))
            };
        }

        function applyTemplateAll(templateItem) {
            if (!templateItem.id) {
                _assignTemplateContentToFormProperties(TaskTemplateSubmitFormFactory.createNew().form());
                _.assign($scope.ui.uiSelect, {to:[], cc:[]});
                $scope.ui.loading = false;
                return;
            }

            TaskTemplateApiBiz.get($scope.form.projectCode, templateItem.id, true).then(function (result) {
                _assignTemplateContentToFormProperties(result.contents());
                _.assign($scope.ui.uiSelect, {
                    to: TagInputTaskHelper.toDetailMemberOrGroupFromDetailInfo(_.get(result.contents(), 'users.to', []), result.refMap),
                    cc: TagInputTaskHelper.toDetailMemberOrGroupFromDetailInfo(_.get(result.contents(), 'users.cc', []), result.refMap)
                });
                $scope.ui.loading = false;
            });
        }

        $scope.selectTemplateItem = function (templateItem) {
            if (isEmptyForm()) {
                applyTemplateAll(templateItem);
                return;
            }

            var alertMessage = templateItem.id === null ? gettextCatalog.getString('템플릿을 삭제하면 입력된 내용이 모두 사라집니다. 템플릿을 삭제하시겠습니까?') :
                gettextCatalog.getString('템플릿을 변경하면 입력된 내용이 모두 사라지고 새로운 템플릿의 내용으로 변경됩니다. 템플릿을 변경하시겠습니까?');

            MessageModalFactory.confirm(alertMessage, '', {
                confirmBtnLabel: templateItem.id === null ? gettextCatalog.getString('삭제') : gettextCatalog.getString('편집')
            }).result.then(function () {
                applyTemplateAll(templateItem);
            });
            $scope.ui.loading = false;
        };


        //TODO 변경공지에 대해서만 임시적으로 아래 조건에 따라 유효검증 수행
        TaskWriteformBiz.addValidationPromise(function () {
            var invalidList = [];
            if ($scope.form.projectCode === '(장애관리)변경관리') {
                if (!$scope.form.startedAt) {
                    invalidList.push({key: 'startedAt', msg: gettextCatalog.getString('일정 범위를 입력해 주세요.')});
                }
                if (!$scope.form.endedAt) {
                    invalidList.push({key: 'endedAt', msg: gettextCatalog.getString('일정 범위를 입력해 주세요.')});
                }
                if ($scope.form.startedAt && $scope.form.endedAt && moment($scope.form.startedAt).isAfter(moment($scope.form.endedAt))) {
                    invalidList.push({key: 'dateRangeWrong', msg: gettextCatalog.getString('시작일은 종료일 이전으로 입력해 주세요.')});
                }
            }
            return invalidList.length > 0 ? $q.reject(invalidList) : $q.when();
        });

        //업무 등록창 일경우 필수 태그 지정 유효성 검증
        if ($scope.type.isTask) {
            TaskWriteformBiz.addValidationPromise(function () {
                //개인 프로젝트일 경우 태그 Validation 없이 넘어감
                if (MY_PROJECT_CODE === $scope.form.projectCode) {
                    return $q.when();
                }

                return TagBiz.getTags($scope.form.projectCode).then(function (result) {
                    var requiredTagPrefixMap = {}, formTagIds = $scope.form.tagIdList;  //_.map($scope.form.tagIdList, 'id');
                    _.forEach(_.result(result.refMap, 'tagPrefixMap'), function (tagPrefix, key) {
                        if (tagPrefix.mandatory === true) {
                            requiredTagPrefixMap[key] = tagPrefix;
                        }
                    });
                    var selectedTagPrefixies = _(result.contents()).filter(function (tag) {
                        return _.includes(formTagIds, tag.id);
                    }).map(function (tag) {
                        return String(tag.tagPrefixId);
                    }).uniq().value();

                    var remainRequireTagIdList = _.difference(_.map(requiredTagPrefixMap, function (tagprefix, key) {
                        return key;
                    }), selectedTagPrefixies);
                    if (remainRequireTagIdList.length > 0) {
                        var errorMap = {
                            key: 'requiredTagPrefix',
                            msg: gettextCatalog.getString('필수 태그 그룹을 선택해 주세요.')
                        }, errorTagPrefixNames = [];
                        errorMap.msg += '<p style="color:red;">';
                        _.forEach(remainRequireTagIdList, function (tagPrefixId) {
                            errorTagPrefixNames.push(requiredTagPrefixMap[tagPrefixId].name);
                        });
                        errorTagPrefixNames.sort();
                        errorMap.msg += errorTagPrefixNames.join(',&nbsp;') + '</p>';
                        return $q.reject(errorMap);
                    }
                    return $q.when();
                });
            });
        }

        $scope.fetchSearchProjects = function (keyword) {
            $scope.ui.searchTargetProjects = keyword ? $scope.ui.projects : $scope.ui.memberProjects;
        };

        $scope.selectTagItem = function (tagItem) {
            var isSelectOne = _.get(tagItem._wrap.refMap.tagPrefixMap(tagItem.tagPrefixId), 'selectOne');
            _.forEach(TagBiz.filterSelectOneTagList(tagItem, $scope.ui.tags, isSelectOne), function (tagId) {
                $scope.form.tagIdList.splice($scope.form.tagIdList.indexOf(tagId), 1);
            });
            if (!TagBiz.validate($scope.form.tagIdList, tagItem, true)) {
                _.set(_.find($scope.ui.tags, {'id': tagItem.id}), '_ticked', false);
                tagItem._ticked = false;
            }
            TagBiz.applyIcon(tagItem, $scope.ui.tags);
        };

        $scope.openTagSettings = function (projectCode) {
            ProjectManagementModalFactory.open(projectCode, {activeTabName: ProjectManagementModalFactory.TAB_NAMES.TAG});
        };

        $scope.openMilestoneSettings = function (projectCode) {
            ProjectManagementModalFactory.open(projectCode, {activeTabName: ProjectManagementModalFactory.TAB_NAMES.MILESTONE});
        };

        $scope.openTemplateSettings = function (projectCode) {
            ProjectManagementModalFactory.open(projectCode, {activeTabName: ProjectManagementModalFactory.TAB_NAMES.TEMPLATE});
        };

        $scope.ui.dueDateMode = '';
        $scope.descDueDate = function () {
            return DueDateService.getDueDateModePostfix($scope.ui.dueDateMode);
        };

        // TODO 폰트로 인해 리사이즈해서 search input이 넓이를 다시 계산하도록 하는 코드
        $timeout(function () {
            angular.element($window).trigger('resize');
        }, 500, false);


        RootScopeEventBindHelper.withScope($scope)
            .on(TagBiz.EVENTS.RESETCACHE, resetTags)
            .on(MilestoneBiz.EVENTS.RESETCACHE, resetMilestones)
            .on(TaskTemplateApiBiz.EVENTS.RESETCACHE, resetTaskTemplates);
    }

    /* @ngInject */
    function TaskWriteformEditorCtrl($scope, $timeout, PaletteBiz, WriteFormShare, DigestService, SUBMIT_FORM_MODES, _) {
        var isChangedProjectCode = false;
        $scope.options = {
            markdown: {
                minimumPreviewModeWidth: 850,
                isTemplate: $scope.type.isTemplate
            }
        };

        $scope.onFocusEditor = function () {
            PaletteBiz.setSearchBoost({
                projectCode: $scope.form.projectCode,
                postNumber: isChangedProjectCode ? null : $scope.form.number
            });
        };

        var disableWatch = $scope.$watch('form.projectCode', function (newVal, oldVal) {
            if (oldVal && (newVal !== oldVal)) {
                isChangedProjectCode = true;
                disableWatch();
            }
        });

        $scope.onLoadEditor = function(editor) {

            //WATCH DRAFT 처음 실행시점이 템플릿 목록이 처음 로딩된 후에 기본 템플릿이 있다면 적용 후 비동기 시작
            var loadCompletedTemplateList = $scope.$watch('ui.loading', function (newVal) {
                if (newVal) {
                    return;
                }

                loadCompletedTemplateList();

                //TODO 에디터에 값을 최초 설정할때 form.body.content 데이터와 에디터 삽입후의 데이터가 변경되므로 submitForm.isFormModified() 조건 초기화
                //WriteFormShare.submitForm().withForm('body.content', adapter.getText()).resetFormModified();

                if ($scope.type.isTask && ($scope.mode.isNew || $scope.mode.isDraft)) {
                    //UPDATE $scope.parent mode
                    WriteFormShare.submitForm().withOption('mode', SUBMIT_FORM_MODES.DRAFT);
                    $scope.$parent.mode = WriteFormShare.mode();
                    $scope.draftAction.watchForAutoSave();
                    editor.on('change', _.debounce(function () {
                        DigestService.safeGlobalDigest();
                    }, 300));
                }
            });

            //Editor 에서 포커스 없앨때까지 임시처리
            if(editor.getCodeMirror) {
                $timeout(function () {
                    editor.getCodeMirror().refresh();
                }, 1000, false);
            }
        };
    }

    /* @ngInject */
    function TaskWriteformFragmentsBodyCtrl($scope, MessageModalFactory, PostTempSaveStorage, WriteFormShare, gettextCatalog) {
        //form 이나 업로드된 파일 목록이 변경되거나 에디터 모드가 변경되었을 경우 에디터영역 리사이즈 반영

        $scope.tempSaveAction = {
            remove: function () {
                return MessageModalFactory.confirm(gettextCatalog.getString('임시 저장된 템플릿을 삭제하시겠습니까?'), '', gettextCatalog.getString('삭제.1')).result.then(function () {
                    PostTempSaveStorage.removeItemUpdate($scope.form.id);
                    WriteFormShare.submitForm().withOption('fromTempSave', false);
                });
            }
        };
    }

})();
