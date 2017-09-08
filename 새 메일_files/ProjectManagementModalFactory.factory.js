(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .factory('ProjectManagementModalFactory', ProjectManagementModalFactory)
        .controller('CreateProjectCtrl', CreateProjectCtrl)
        .controller('ProjectManagementCtrl', ProjectManagementCtrl);


    /* @ngInject */
    function ProjectManagementModalFactory($state, $uibModal, $q, ORG_STATE_NAME, PROJECT_MEMBER_ROLE, HelperConfigUtil, ProjectMemberBiz, gettextCatalog) {
        var TABS = {
            INFO: {
                title: gettextCatalog.getString('기본 정보'),
                templateUrl: 'modules/setting/common/project/info/projectInfo.html'
            },
            MEMBER: {
                title: gettextCatalog.getString('멤버'),
                templateUrl: 'modules/setting/common/project/member/memberManagement.html'
            },
            MILESTONE: {
                title: gettextCatalog.getString('마일스톤'),
                templateUrl: 'modules/setting/common/project/milestone/milestoneManagement.html'
            },
            TAG: {
                title: gettextCatalog.getString('태그'),
                templateUrl: 'modules/setting/common/project/tag/tagSetting.html'
            },
            TEMPLATE: {
                title: gettextCatalog.getString('템플릿'),
                templateUrl: 'modules/setting/common/project/template/templateSetting.html'
            },
            PRIORITY: {
                title: gettextCatalog.getString('우선순위'),
                templateUrl: 'modules/setting/common/project/priority/prioritySetting.html'
            },
            SHARED_LINK: {
                title: gettextCatalog.getString('공유 링크'),
                templateUrl: 'modules/setting/common/project/sharedLink/sharedLink.html'
            },
            WEB_BOOK: {
                title: gettextCatalog.getString('웹 훅'),
                templateUrl: 'modules/setting/common/project/webhook/webhook.html'
            }
        };

        var TAB_NAMES = {
            INFO: 'INFO',
            MEMBER: 'MEMBER',
            MILESTONE: 'MILESTONE',
            TAG: 'TAG',
            TEMPLATE: 'TEMPLATE',
            PRIORITY: 'PRIORITY',
            SHARED_LINK: 'SHARED_LINK',
            WEB_BOOK: 'WEB_BOOK'
        };

        return {
            TAB_NAMES: TAB_NAMES,
            'new': function (projectScope, organizationId) {
                var modalInstance = $uibModal.open({
                    'templateUrl': 'modules/setting/common/project/projectCreate.html',
                    'backdrop': 'static', /*  this prevent user interaction with the background  */
                    'windowClass': 'setting-modal project-management dooray-setting-content',
                    'controller': 'CreateProjectCtrl',
                    'resolve': {
                        projectScope: function () {
                            return projectScope;
                        },
                        organizationId: function () {
                            return organizationId;
                        }
                    }
                });
                return $q.when(modalInstance);
            },

            // option: { activeTabName: 'INFO', activeSubTabName: 'active' }
            open: function (projectCode, option) {
                option = option || {};

                var openModal = function (viewTabs, activeTabIndex, permissionRole) {
                    return $uibModal.open({
                        'templateUrl': 'modules/setting/common/project/projectManagement.html',
                        'windowClass': 'setting-modal project-management dooray-setting-content',
                        'backdrop': 'static', /*  this prevent user interaction with the background  */
                        'controller': 'ProjectManagementCtrl',
                        'resolve': {
                            activeSubTabName: function () {
                                return option.activeSubTabName;
                            },
                            activeTabIndex: function () {
                                return activeTabIndex;
                            },
                            viewTabs: function () {
                                return viewTabs;
                            },
                            permissionRole: function () {
                                return permissionRole;
                            },
                            projectCode: function () {
                                return projectCode;
                            }
                        }
                    });
                };

                var openProjectSettingModalAsAdmin = function (option) {
                    var viewTabs = [
                        TABS.INFO,
                        TABS.MEMBER,
                        TABS.MILESTONE,
                        TABS.TAG,
                        TABS.TEMPLATE,
                        TABS.PRIORITY,
                        TABS.SHARED_LINK,
                        TABS.WEB_BOOK
                    ];
                    var activeTabIndex = viewTabs.indexOf(TABS[option.activeTabName]);
                    return openModal(viewTabs, (activeTabIndex < 0 ? 0 : activeTabIndex), 'projectAdmin');
                };

                var openProjectSettingModal = function (option) {
                    var viewTabs = [
                        TABS.MEMBER,
                        TABS.MILESTONE,
                        TABS.TAG,
                        TABS.TEMPLATE,
                        TABS.SHARED_LINK
                    ];
                    var activeTabIndex = viewTabs.indexOf(TABS[option.activeTabName]);
                    return openModal(viewTabs, (activeTabIndex < 0 ? 0 : activeTabIndex), 'projectMember');
                };

                //angular-permission의 ui-router 기능을 직접 사용하여 처리함
                return $state.includes(ORG_STATE_NAME) ? openProjectSettingModalAsAdmin(option) :
                    ProjectMemberBiz.fetchByMemberId(projectCode, HelperConfigUtil.orgMemberId()).then(function (result) {
                        return result.contents().role === PROJECT_MEMBER_ROLE.ADMIN.ROLE ?
                            openProjectSettingModalAsAdmin(option) : openProjectSettingModal(option);
                    });

            }
        };
    }

    /* @ngInject */
    function CreateProjectCtrl($uibModalInstance, $scope, PATTERN_REGEX, REPLACE_REGEX, organizationId, projectScope) {
        $scope.PATTERN_REGEX = PATTERN_REGEX;
        $scope.REPLACE_REGEX = REPLACE_REGEX;

        $scope.shared = {
            projectCode: null,
            projectScope: projectScope,
            organizationId: organizationId
        };

        $scope.close = function (result) {
            $uibModalInstance.close(result);
        };

        $scope.dismiss = function () {
            $uibModalInstance.dismiss();
        };
    }

    /* @ngInject */
    function ProjectManagementCtrl($scope, $uibModalInstance, EMIT_EVENTS, PATTERN_REGEX, REPLACE_REGEX, Project, RootScopeEventBindHelper, activeSubTabName, activeTabIndex, viewTabs, permissionRole, projectCode) {
        $scope.PATTERN_REGEX = PATTERN_REGEX;
        $scope.REPLACE_REGEX = REPLACE_REGEX;
        $scope.tabs = viewTabs;
        $scope.tabIndex = 0;
        $scope.shared = {
            projectCode: projectCode,
            projectState: null
        };
        $scope.permissionRole = permissionRole;
        var oldIndex = 0;

        $scope.setTabIndex = function (index) {
            var i = 0,
                length = $scope.tabs.length;

            for (; i < length; i++) {
                if (index === i) {
                    $scope.tabIndex = i;
                }
                $scope.tabs[i].active = (index === i);
            }
            RootScopeEventBindHelper.emit(EMIT_EVENTS.CHANGE_PROJECT_MANAGEMENT_TAB_INDEX, $scope.tabIndex, oldIndex);
            oldIndex = $scope.tabIndex;
        };

        $scope.setTabIndex(Math.max(0, activeTabIndex));

        $scope.activeSubTabName = activeSubTabName;

        $scope.close = function (result) {
            $uibModalInstance.close(result);
        };

        $scope.dismiss = function () {
            $uibModalInstance.dismiss();
        };

        function fetchProject() {
            Project.fetchByCode($scope.shared.projectCode).then(function (result) {
                $scope.shared.projectState = result.contents().state;
            });
        }

        fetchProject();
        RootScopeEventBindHelper.withScope($scope).on(Project.EVENTS.RESETCACHE, fetchProject);
    }

})();
