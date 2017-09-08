/**
 * @ngdoc overview
 * @name doorayWebApp.setting.admin
 * @description
 * # doorayWebApp.setting.admin
 *
 * Shared Template module of the application.
 */

(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin', [])
        .constant('ORG_STATE_NAME', 'main.org')
        .constant('ORG_BOX_INFO', {
            info: {
                name: '테넌트 관리',
                menus: {
                    company: {
                        name: '테넌트 정보',
                        controller: 'OrgCompanyCtrl',
                        templateUrl: 'modules/setting/admin/tenant/company/orgCompany.html',
                        allowRole: 'admin,owner'
                    },
                    tenantSetting: {    //MERGE domain, translator
                        name: '테넌트 설정',
                        allowRole: 'admin,owner',
                        template: '<tenant-setting></tenant-setting>'
                    },
                    orgList: {
                        name: '조직 구성',
                        controller: 'OrgListCtrl',
                        templateUrl: 'modules/setting/admin/tenant/org/orgList.html'
                    },
                    secureLog: {
                        name: '감사 기록',
                        controller: 'AuditLogCtrl',
                        templateUrl: 'modules/setting/admin/tenant/audit/auditLog.html',
                        enableNewFeature: true
                    }
                }
            },
            org_setting: {
                name: '조직 관리.1',
                menus: {
                    general: {
                        name: '조직 정보',
                        controller: 'OrgGeneralCtrl',
                        templateUrl: 'modules/setting/admin/org/general/general.html'
                    },
                    member: {
                        name: '멤버 관리.1',
                        controller: 'OrgMemberCtrl',
                        templateUrl: 'modules/setting/admin/org/member/member.html'
                    },
                    authority: {
                        name: '권한 관리',
                        controller: 'OrgAuthorityCtrl',
                        templateUrl: 'modules/setting/admin/org/authority/authority.html'
                    }
                }
            },
            svr_setting: {
                name: '서비스 설정',
                menus: {
                    environment: {
                        name: '사용 및 제한',
                        controller: 'OrgEnvironmentCtrl',
                        templateUrl: 'modules/setting/admin/svr/environment/orgEnvironment.html'
                    },
                    project: {  //MERGE project + sharedLink
                        name: '프로젝트',
                        controller: 'OrgProjectCtrl',
                        templateUrl: 'modules/setting/admin/svr/project/project.html'
                    },
                    sharedLink: {
                        name: '공유 링크',
                        controller: 'OrgSharedLinkCtrl',
                        templateUrl: 'modules/setting/admin/svr/sharedLink/sharedLink.html'
                    },
                    mail: {
                        name: '메일',
                        controller: 'OrgMailSettingsCtrl',
                        templateUrl: 'modules/setting/admin/svr/OrgMailSettings/orgMailSettings.html'
                    }
                }
            }/*,
             report: {
             name: '리포트',
             menus: {
             org: {
             name: '조직 리포트',
             controller: '',
             templateUrl: ''
             },
             project: {
             name: '프로젝트 리포트',
             controller: '',
             templateUrl: ''
             }
             }
             }*/
        });

})();
