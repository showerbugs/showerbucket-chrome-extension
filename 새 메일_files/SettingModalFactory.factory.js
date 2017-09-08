(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .factory('SettingModalFactory', SettingModalFactory)
        .controller('SettingModalCtrl', SettingModalCtrl)
        .factory('SettingMenuFactory', SettingMenuFactory);

    /* @ngInject */
    function SettingModalFactory($uibModal) {

        return {
            open: function (targetSetting) {
                return $uibModal.open({
                    templateUrl: 'modules/setting/user/settings.html',
                    controller: 'SettingModalCtrl',
                    windowClass: 'dooray-setting-modal dooray-setting-content',
                    resolve: {
                        openTargetSetting: function () {
                            return targetSetting;
                        }
                    }
                });
            }
        };
    }


    /* @ngInject */
    function SettingMenuFactory(HelperConfigUtil, gettextCatalog, _) {
        var useService = HelperConfigUtil.serviceUse(),
            enableNewFeature = HelperConfigUtil.enableNewFeature();

        var settingConfig = {
            account: {
                title: gettextCatalog.getString('계정'),
                controller: 'ProfileCtrl',
                template: 'modules/setting/user/account/profile.html',
                menuDepth: 0
            },
            common: {
                title: gettextCatalog.getString('일반.1'),
                controller: 'ServiceCommonCtrl',
                template: 'modules/setting/user/commonService/common.html',
                menuDepth: 0
            },
            stream: {
                title: gettextCatalog.getString('스트림'),
                controller: 'StreamSettingCtrl',
                template: 'modules/setting/user/stream/stream.html',
                menuDepth: 0
            },
            project: {
                title: gettextCatalog.getString('프로젝트'),
                controller: 'ProjectListSettingCtrl',
                template: 'modules/setting/user/project/projectList.html',
                hide: !enableNewFeature && !useService.project,
                menuDepth: 0
            },
            mail: {
                title: gettextCatalog.getString('메일'),
                hide: !enableNewFeature && !useService.mail,
                menuDepth: 1,
                menu: {
                    mailRule: {
                        title: gettextCatalog.getString('자동 분류'),
                        controller: 'MailRuleCtrl',
                        template: 'modules/setting/user/mailRule/mailRule.html'
                    },
                    imap: {
                        isComponent: true,
                        title: 'IMAP',
                        template: '<imap-setting></imap-setting>'
                    },
                    signature: {
                        isComponent: true,
                        title: gettextCatalog.getString('서명'),
                        template: '<mail-signature-setting></mail-signature-setting>'
                    }/*, TODO API 작성되면 열기
                    autoReply: {
                        isComponent: true,
                        title: gettextCatalog.getString('부재중 설정'),
                        template: '<mail-auto-reply></mail-auto-reply>'
                    }*/
                }
            },
            calendar: {
                title: gettextCatalog.getString('캘린더'),
                hide: !enableNewFeature && !useService.calendar,
                menuDepth: 1,
                menu: {
                    myCalendar: {
                        title: gettextCatalog.getString('내 캘린더'),
                        controller: 'CalendarSettingCtrl',
                        template: 'modules/setting/user/calendar/calendar.html'
                    },
                    calDAV: {
                        isComponent: true,
                        title: 'CalDAV',
                        template: '<cal-dav-setting></cal-dav-setting>'
                    }
                }

            },
            linkage: {
                title: gettextCatalog.getString('서비스 연동'),
                permissionRoles: ['owner', 'admin', 'member'],
                menuDepth: 0,
                controller: 'OrgLinkageCtrl',
                template: 'modules/setting/user/linkage/linkage.html'
            }
        };


        function hasPermission(setting, role) {
            if (setting.permissionRoles && !_.includes(setting.permissionRoles, role)) {
                return false;
            } else if (setting.enableFeature && !HelperConfigUtil.enableNewFeature()) {
                return false;
            }
            return true;
        }

        function reflectSetting(settings, action) {
            _.forEach(settings, function (setting, key) {
                if (setting.menu) {
                    reflectSetting(setting.menu, action);
                }
                action(setting, key);
                setting.close = true;
            });
        }

        function findSetting(settings, checkSetting) {
            for (var key in settings) {
                if (settings[key].menu) {
                    if (findSetting(settings[key].menu, checkSetting)) {
                        settings[key].close = false;
                        return true;
                    }
                }
                if (checkSetting(settings[key], key)) {
                    return true;
                }
            }
        }

        return {
            getSetting: function (settings, targetKey, role) {
                var targetSetting;
                findSetting(settings, function (setting, key) {
                    if (hasPermission(setting, role) && targetKey === key) {
                        targetSetting = setting;
                        return true;
                    }
                    return false;
                });
                return targetSetting;
            },
            getSettings: function (role) {
                reflectSetting(settingConfig, function (setting) {
                    if (!hasPermission(setting, role)) {
                        setting.hide = true;
                    }
                });
                return settingConfig;
            }
        };
    }


    /* @ngInject */
    function SettingModalCtrl($scope, $uibModalInstance, ORG_MEMBER_ROLE, HelperConfigUtil, MyInfo, OrganizationBiz, openTargetSetting, SettingMenuFactory, MessageModalFactory, gettextCatalog, _) {
        var defaultSetting = 'account';

        function findMyHighestOrgRole(roles) {
            if (_.includes(roles, ORG_MEMBER_ROLE.OWNER.ROLE)) {
                return ORG_MEMBER_ROLE.OWNER.ROLE;
            }

            if (_.includes(roles, ORG_MEMBER_ROLE.ADMIN.ROLE)) {
                return ORG_MEMBER_ROLE.ADMIN.ROLE;
            }

            if (_.includes(roles, ORG_MEMBER_ROLE.MEMBER.ROLE)) {
                return ORG_MEMBER_ROLE.MEMBER.ROLE;
            }

            return ORG_MEMBER_ROLE.GUEST.ROLE;
        }

        function refreshMyInfo() {
            return MyInfo.resetCache().then(function(){
                getMyInfo();
            });
        }

        function getMyInfo() {
            return MyInfo.getMyInfo().then(function (myInfo) {
                $scope.myInfo = myInfo;
                return myInfo;
            });
        }

        $scope.enableNewFeature = HelperConfigUtil.enableNewFeature();
        $scope.refreshMyInfo = refreshMyInfo;

        function init() {
            getMyInfo().then(function (myInfo) {
                var myRoleList = _.map($scope.myInfo.organizationMemberRoleMap, 'role');
                if(myRoleList.length > 0){
                    $scope.myInfo._getOrSetProp('highestMyOrgRole', findMyHighestOrgRole(myRoleList));
                    $scope.settingsConfig = SettingMenuFactory.getSettings(myInfo._getOrSetProp('highestMyOrgRole'));
                }
                var changeSetting = SettingMenuFactory.getSetting($scope.settingsConfig, openTargetSetting || defaultSetting, $scope.myInfo._getOrSetProp('highestMyOrgRole'));
                if (!changeSetting) {
                    MessageModalFactory.alert(gettextCatalog.getString('<p>일시적인 오류입니다.</p><p>다시 한번 시도해 주세요.</p>'));
                    return;
                }
                $scope.changeSetting(changeSetting);
            });
            OrganizationBiz.get().then(function(result) {
                $scope.orgsInfo = result;
            });
        }

        $scope.changeToFirstSetting = function (item) {
            if (!item.close) {
                $scope.current = _.values(item.menu)[0];
            }
        };

        $scope.changeSetting = function (item) {
            $scope.current = item;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss();
        };

        $scope.openFirstMenu = function (setting) {
            if (setting.close) {
                $scope.changeSetting(_.find(setting.menu, function (setting) {
                    return !setting.hide;
                }));
            }
        };

        init();
    }

})();
