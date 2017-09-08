(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .controller('MailRuleCtrl', MailRuleCtrl)
        .controller('MailRuleFormCtrl', MailRuleFormCtrl)
        .factory('MailRuleModalFormFactory', MailRuleModalFormFactory)
        .factory('MailRuleFormParameterConverterFactory', MailRuleFormParameterConverterFactory);

    /* @ngInject */
    function MailRuleCtrl($scope, MailRuleBiz, MailRuleModalFormFactory, MailFolderUtil, _) {
        var fetchList = function () {
            MailRuleBiz.fetchList().then(function (result) {
                $scope.ruleList = result.contents();
            });
        };

        fetchList();

        var dragStartIndex = -1;
        var draggingRuleId = -1;

        $scope.getDisplayFolderName = function (folder) {
            return MailFolderUtil.convertDisplaySystemFolderName(folder.name) || folder.name; //MailFolderUtil.convertDisplayUserLastFolderName(folder.name);
        };

        $scope.onDragStart = function (index, rule) {
            dragStartIndex = index;
            draggingRuleId = rule.id;
        };

        $scope.onMoved = function (index) {
            $scope.ruleList.splice(index, 1);
            var movedIndex = _.findIndex($scope.ruleList, {id: draggingRuleId});
            if (dragStartIndex === movedIndex) {
                return;
            }
            movedIndex += movedIndex > dragStartIndex ? -1 : 1;
            MailRuleBiz.changeOrder(draggingRuleId, $scope.ruleList[movedIndex].applyOrder).then(function () {
                fetchList();
            });
        };

        $scope.openRuleForm = function () {
            MailRuleModalFormFactory.open().then(function (modal) {
                modal.result.then(function () {
                    fetchList();
                });
            });
        };

        $scope.remove = function (id) {
            MailRuleBiz.remove(id).then(function () {
                fetchList();
            });
        };

        $scope.update = function (rule) {
            MailRuleModalFormFactory.update(rule).then(function (modal) {
                modal.result.then(function () {
                    fetchList();
                });
            });
        };

    }


    /* @ngInject */
    function MailRuleModalFormFactory($uibModal, $q) {
        var openForm = function (rule) {
            return $uibModal.open({
                'templateUrl': 'modules/setting/user/mailRule/mailRuleForm.html',
                'backdrop': 'static',
                'windowClass': 'mail-rule-form dooray-setting-content',
                'controller': MailRuleFormCtrl,
                'resolve': {
                    rule: function () {
                        return rule || {};
                    }
                }
            });
        };
        return {
            open: function () {
                return $q.when(openForm());
            },
            update: function (rule) {
                return $q.when(openForm(rule));
            }
        };
    }

    /* @ngInject */
    function MailRuleFormParameterConverterFactory(MemberMeEmailAddresses, _) {
        var myEmail = '';

        MemberMeEmailAddresses.fetchList().then(function (result) {
            var mail = _.find(result.contents(), {'default': true});
            myEmail = _.get(mail, 'emailAddress', '');
        });

        //var myEmail = HelperConfigUtil.serviceEmail();
        function setUserConditionParam(condition, formParam, key) {
            var type = formParam.type.value,
                value = (type === 'only' || type === 'includeMe') ? myEmail : formParam.include;

            if (type === 'includeMe') {
                type = 'include';
            }

            condition[key] = key === 'from' ? value : {type: type, value: value};
        }

        function setToFolderActionParam(action, formParam) {
            var checkedAction = formParam.check;
            if (checkedAction === 'exist') {
                action.toFolder = {
                    id: formParam.folder.id
                };
            } else {
                action[checkedAction] = true;
            }
        }


        var CHANGE_API_PARAM_MAP = {
            subject: function (condition, formParam) {
                condition.subject = formParam.include;
            },
            from: setUserConditionParam,
            to: setUserConditionParam,
            cc: setUserConditionParam,
            toFolder: setToFolderActionParam,
            favorited: function (action) {
                _.set(action, 'annotations.favorited', true);
            }
        };

        function getAPIParamFromForm(form) {
            var param = {};
            _.forEach(form, function (obj, key) {
                if (obj === true || obj.check) {
                    if (CHANGE_API_PARAM_MAP[key]) {
                        CHANGE_API_PARAM_MAP[key](param, obj, key);
                    } else {
                        param[key] = obj;
                    }
                }
            });
            return param;
        }


        var CHANGE_FORM_PARAM_MAP = {
            subject: function (param, obj) {
                _.set(param, 'subject.check', true);
                _.set(param, 'subject.include', obj);
            },
            from: function (param, obj) {
                _.set(param, 'from.check', true);
                _.set(param, 'from.type.value', 'include');
                if (obj === myEmail) {
                    _.set(param, 'from.type.value', 'includeMe');
                } else {
                    _.set(param, 'from.include', obj);
                }
            },
            to: function (param, obj) {
                _.set(param, 'to.check', true);
                _.set(param, 'to.type.value', obj.type);
                if (obj.value === myEmail && obj.type === 'includeMe') {
                    _.set(param, 'to.type.value', 'includeMe');
                } else {
                    _.set(param, 'to.include', obj.value);
                }
            },
            cc: function (param, obj) {
                _.set(param, 'cc.check', true);
                _.set(param, 'cc.type.value', obj.type);
                if (obj.value === myEmail && obj.type === 'includeMe') {
                    _.set(param, 'cc.type.value', 'includeMe');
                } else {
                    _.set(param, 'cc.include', obj.value);
                }
            },
            toFolder: function (param, obj) {
                _.set(param, 'toFolder.check', 'exist');
                _.set(param, 'toFolder.folder.id', obj.id);
            },
            toTrash: function (param) {
                _.set(param, 'toFolder.check', 'toTrash');
            },
            toArchive: function (param) {
                _.set(param, 'toFolder.check', 'toArchive');
            },
            annotations: function (param, obj) {
                param.favorited = obj.favorited;
            },
            toPost: function (param, obj) {
                _.set(param, 'toPost.check', true);
                _.set(param, 'toPost.to', obj.to);
                _.set(param, 'toPost.project.id', obj.project.id);
            }
        };

        function getFormParamFromAPI(rule) {
            var param = {};
            _.forEach(rule, function (obj, key) {
                if (CHANGE_FORM_PARAM_MAP[key]) {
                    CHANGE_FORM_PARAM_MAP[key](param, obj, key);
                } else {
                    param[key] = obj;
                }
            });
            return param;
        }

        return {
            getAPIParamFromForm: getAPIParamFromForm,
            makeFormParam: function (apiParam) {
                var param = {
                    condition: getFormParamFromAPI(apiParam.condition),
                    action: getFormParamFromAPI(apiParam.action)
                };
                return param;
            }

        };


    }

    /* @ngInject */
    function MailRuleFormCtrl($scope, $q, $uibModalInstance,
                              HelperFormUtil, CheckDuplicatedUtil, HelperConfigUtil, MailFolderUtil,
                              MailRuleFormParameterConverterFactory,
                              MailFolderResource, Project, MailRuleBiz, gettextCatalog, TagInputTaskHelper, rule, PATTERN_REGEX, _) {

        var allProjectsGroupById = {};

        $scope.getProjects = function (keyword) {
            return keyword ? $scope.allProjects : $scope.projects;
        };

        function _findProjectById(projectId) {
            return allProjectsGroupById[projectId];
        }

        function asyncProjectList() {
            return $q.all([Project.fetchMyActiveList(), Project.fetchActivePublicList()]).then(function (results) {
                $scope.projects = results[0].contents();
                $scope.allProjects = _($scope.projects).concat(results[1].contents()).uniq('code').map(function (project) {
                    var refMap = _.get(project, '_wrap.refMap');
                    project._name = project._name || project.code;  // project._name 은 HelperConfigUtil.myProjectItem()에서 있어서 예외처리
                    project._organizationName = refMap ? _.get(refMap.organizationMap(project.organizationId), 'name') : null;
                    return project;
                }).value();
                allProjectsGroupById = _.keyBy($scope.allProjects, 'id');

                if (HelperConfigUtil.orgMemberId()) {
                    $scope.projects.unshift(HelperConfigUtil.myProjectItem());
                }
                return $q.when($scope.allProjects);
            });
        }

        function fetchFolder() {
            //메일의 폴더 목록 가져오기
            return MailFolderResource.get({page:0, size:10000}).$promise.then(function (result) {
                var systemFolders = _.filter(result.contents(), MailFolderUtil.isSystemFolder),
                    userFolders = _.filter(result.contents(), MailFolderUtil.isUserFolder);
                $scope.folderList = _.filter(MailFolderUtil.createDisplayAllFoldersFlatten(systemFolders, userFolders), function (folder) {
                    return !folder.forbiddenMailMove && folder.name !== 'trash';
                });
                return $q.when(result);
            });
        }

        function initUserCondition() {
            $scope.condition.from.type = getInitUserCondition($scope.userConditionsMap[0], $scope.condition.from.type.value || 'include');
            $scope.condition.to.type = getInitUserCondition($scope.userConditionsMap[1], $scope.condition.to.type.value || 'only');
            $scope.condition.cc.type = getInitUserCondition($scope.userConditionsMap[2], $scope.condition.cc.type.value || 'only');
        }

        function getInitUserCondition(condition, value) {
            return _.find(condition.types, {'value': value});
        }

        function initSelectFolder() {
            var folderId = _.get($scope.action, 'toFolder.folder.id');
            var foldersLodash = _($scope.folderList).map('folder');

            //TODO 폴더가 선택되지 않은 상태에서는 기본값으로 BE에서 내려주는 createdAt을 보고 맨 마지막에 추가된 폴더가 선택되어져야 함
            var selectedFolder = folderId ? foldersLodash.find({id: folderId}) : foldersLodash.sortBy('createdAt').last();
            $scope.action.toFolder.folder = selectedFolder || foldersLodash.sortBy('createdAt').last();
        }


        function init() {
            //form 등록
            $scope.FORM_NAME = 'mailRule';
            HelperFormUtil.bindService($scope, $scope.FORM_NAME);

            $scope.userConditionsMap = [
                {
                    name: gettextCatalog.getString('보낸 사람'),
                    target: 'from',
                    types: [
                        {name: gettextCatalog.getString('내가 보냄'), value: 'includeMe'},
                        {name: gettextCatalog.getString('다음을 포함'), value: 'include'}
                    ]
                },
                {
                    name: gettextCatalog.getString('받는 사람'),
                    target: 'to',
                    types: [
                        {name: gettextCatalog.getString('나만 있음'), value: 'only'},
                        {name: gettextCatalog.getString('나도 포함'), value: 'includeMe'},
                        {name: gettextCatalog.getString('다음을 포함'), value: 'include'}
                    ]
                },
                {
                    name: gettextCatalog.getString('참조'),
                    target: 'cc',
                    types: [
                        {name: gettextCatalog.getString('나만 있음'), value: 'only'},
                        {name: gettextCatalog.getString('나도 포함'), value: 'includeMe'},
                        {name: gettextCatalog.getString('다음을 포함'), value: 'include'}
                    ]
                }
            ];

            $scope.condition = {
                subject: {}, to: {type: {}}, from: {type: {}}, cc: {type: {}}
            };

            $scope.action = {
                toFolder: {}, toPost: {to: []}
            };

            $scope.applyBeforeMail = false;


            if (!_.isEmpty(rule)) {
                $scope.isEditForm = true;
            }
            initUserCondition();

            $q.all([asyncProjectList(), fetchFolder()]).then(function () {
                if ($scope.isEditForm) {
                    var param = MailRuleFormParameterConverterFactory.makeFormParam(rule);

                    _.assign($scope.condition, param.condition);
                    _.assign($scope.action, param.action);
                }


                //메일 자동분류 조건 셀렉트 박스 초기화
                initUserCondition();
                initSelectFolder();
            });
        }

        init();

        $scope.ok = function () {
            var param = {
                'type': 'auto_classification',  //자동분류 설정
                'condition': MailRuleFormParameterConverterFactory.getAPIParamFromForm($scope.condition),
                'action': MailRuleFormParameterConverterFactory.getAPIParamFromForm($scope.action),
                'applyBeforeMail': $scope.applyBeforeMail
            };
            $scope.isEmptyCondition = _.isEmpty(param.condition);
            $scope.isEmptyAction = _.isEmpty(param.action);
            if (HelperFormUtil.checkInvaild($scope[$scope.FORM_NAME]) || $scope.isEmptyCondition || $scope.isEmptyAction) {
                return;
            }

            if ($scope.isEditForm) {
                MailRuleBiz.update(rule.id, param).then(function () {
                    $uibModalInstance.close();
                });
            } else {
                MailRuleBiz.save([param]).then(function () {
                    $uibModalInstance.close();
                });
            }
        };

        $scope.getBeforeMailList = function () {
            $scope.beforeMailList = [];

            var param = MailRuleFormParameterConverterFactory.getAPIParamFromForm($scope.condition);
            $scope.isEmptyCondition = _.isEmpty(param);
            if ($scope.isEmptyCondition) {
                return;
            }

            MailRuleBiz.previewApplyBeforeMail(param).then(function (result) {
                $scope.beforeMailList = result.contents();
                $scope.beforeMailList.count = result.totalCount();
            });
        };

        //taginput
        $scope.searchToPostUser = function (query) {
            //신규업무로 등록 시 시용하는 프로젝트id를 코드로 변환해주는 로직이 필요함
            var selectedProject = _findProjectById(_.get($scope.action, 'toPost.project.id')),
                param = {};

            if (_.get(selectedProject, 'code')) {
                param.boost = {
                    projectCode: _.get(selectedProject, 'code')
                };
            }

            TagInputTaskHelper.queryMemberOrGroup(query, param).then(function (result) {
                $scope.searchToPostUsers = result;
            });
        };

        $scope.allowToPostUserTag = function (input) {
            if (PATTERN_REGEX.email.test(input)) {
                return {
                    type: 'emailUser', emailUser: {
                        name: '',
                        emailAddress: input
                    }
                };
            }
        };

        $scope.toPostFilterUser = function (item, listItem) {
            if (!item || !listItem) {
                return false;
            } else if (item.type === 'emailUser') {
                return _.get(item, 'emailUser.emailAddress') === _.get(listItem, 'emailUser.emailAddress');
            }
            return _.get(item[item.type], 'id') === _.get(listItem[listItem.type], 'id');
        };

        $scope.onSelectToPostUser = function ($item) {
            if ($item.type === 'group') {
                $item.group.members = [];
                TagInputTaskHelper.queryProjectMember($item.group).then(function (result) {
                    $item.group.members = result;
                });
            }
        };

        $scope.selectRuleWhenFocus = function (rule) {
            rule.check = true;
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };

        $scope.checkDuplicatedFolderName = function (name) {
            return MailFolderResource.get({page:0, size:10000}).$promise.then(function (result) {
                return !CheckDuplicatedUtil.byString(result[0].user, 'name', name);
            });
        };

        $scope.syncExcludeStream = function () {
            var excludeStreamFolders = ['toTrash', 'toArchive'];
            if (_.includes(excludeStreamFolders, $scope.action.toFolder.check)) {
                $scope.action.excludeStream = true;
            }
        };

        $scope.showEmailInputBox = function (condition) {
            return condition.check && condition.type.value === 'include' && !condition.type.isMine;
        };


    }

})();
