(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarSettingModal', CalendarSettingModal)
        .controller('CalendarCreateModalCtrl', CalendarCreateModalCtrl)
        .controller('CalendarUpdateModalCtrl', CalendarUpdateModalCtrl)
        .controller('CalendarSettingModalCtrl', CalendarSettingModalCtrl);

    /* @ngInject */
    function CalendarSettingModal($uibModal) {
        var templateUrl = 'modules/calendar/modals/CalendarSettingModal/calendarSettingModal.html';

        return {
            'new': function () {
                return $uibModal.open({
                    'templateUrl': templateUrl,
                    'backdrop': 'static', /*  this prevent user interaction with the background  */
                    'windowClass': 'setting-modal dooray-setting-content calendar-setting-modal',
                    'controller': 'CalendarCreateModalCtrl'
                }).result;
            },
            'update': function (calendar) {
                return $uibModal.open({
                    'templateUrl': templateUrl,
                    'backdrop': 'static', /*  this prevent user interaction with the background  */
                    'windowClass': 'setting-modal dooray-setting-content calendar-setting-modal',
                    'controller': 'CalendarUpdateModalCtrl',
                    'resolve': {
                        calendar: function () {
                            return calendar;
                        }
                    }
                }).result;
            }
        };
    }

    /* @ngInject */
    function CalendarCreateModalCtrl($controller, $scope, $uibModalInstance, CalendarAction, Member, CalendarAlarmUtil, gettextCatalog) {
        $controller('CalendarSettingModalCtrl as settingModalCtrl', {
            $scope: $scope,
            $uibModalInstance: $uibModalInstance
        });

        $scope.title = gettextCatalog.getString('캘린더 추가');
        $scope.calendar = {me: {}, name: '', notification: {enabled: true, alarms: CalendarAlarmUtil.getDefaultAlarms()}};
        $scope.settingModalCtrl.sharedMembers = [];
        Member.fetchMyInfo().then(function (result) {
            $scope.settingModalCtrl.master = result.contents();
        });
        $scope.save = save;
        $scope.ui = {
            update: true
        };

        function save() {
            if ($scope.settingModalCtrl.checkValidate()) {
                var param = $scope.settingModalCtrl.makeSaveParam();
                CalendarAction.save(param);
                $uibModalInstance.close('success');
            }
        }
    }

    /* @ngInject */
    function CalendarUpdateModalCtrl($controller, $scope, $uibModalInstance, calendar, CalendarAction, CalendarAlarmUtil, CalendarPermissionUtil, gettextCatalog) {
        $controller('CalendarSettingModalCtrl as settingModalCtrl', {
            $scope: $scope,
            $uibModalInstance: $uibModalInstance
        });

        $scope.title = calendar.displayName + ' ' + (calendar.default? '' : (gettextCatalog.getString('캘린더') + ' ')) + gettextCatalog.getString('설정');
        $scope.calendar = _.cloneDeep(calendar);
        //TODO: 임시코드 -> 원래는 무조건 alarm 객체가 있음
        $scope.calendar.notification = $scope.calendar.notification || {enabled: true};
        //백앤드 버그 때문에 방어코드
        if(!$scope.calendar.notification.alarms || $scope.calendar.notification.alarms.length === 0) {
            $scope.calendar.notification.alarms = CalendarAlarmUtil.getDefaultAlarms();
        }
        $scope.save = save;
        var orgMap = _.get(calendar, '_wrap.refMap.organizationMemberMap', angular.noop);
        $scope.settingModalCtrl.master = orgMap(calendar.ownerOrganizationMemberId);
        $scope.ui = {
            update: CalendarPermissionUtil.canEditCalendar(calendar)
        };

        var orgMemberMap = calendar._wrap.refMap.organizationMemberMap;

        $scope.settingModalCtrl.sharedMembers =
            _(calendar.calendarMemberList).reject({permission: 'owner'}).map(function (member) {
                return {
                    id: member[member.type].organizationMemberId,
                    name: orgMemberMap(member[member.type].organizationMemberId).name,
                    email: orgMemberMap(member[member.type].organizationMemberId).email,
                    type: member.type,
                    permission: member.permission
                };
            }).value();

        function save() {
            if ($scope.settingModalCtrl.checkValidate()) {
                var param = $scope.settingModalCtrl.makeSaveParam();
                CalendarAction.update(calendar.id, param);
                $uibModalInstance.close('success');
            }
        }
    }

    /* @ngInject */
    function CalendarSettingModalCtrl($scope, $uibModalInstance, CalendarRepository, TagInputTaskHelper, PATTERN_REGEX, DOORAY_CALENDAR_COLORS, HelperFormUtil, gettextCatalog, CalendarAlarmUtil, _) {
        var self = this;

        self.master = null;
        self.usedColors = null;
        self.calendarColors = DOORAY_CALENDAR_COLORS;
        self.selectedMemberList = [];
        self.PATTERN_REGEX = PATTERN_REGEX;

        self.TYPES = {
            PRIVATE: {
                code: 'PRIVATE',
                param: 'private'
            },
            SHARED: {
                code: 'SHARED',
                param: 'shared',
                inputPlaceholder: gettextCatalog.getString('공유할 멤버'),
                permissionList: [{
                    name: gettextCatalog.getString('일정 조회'),
                    code: 'view'
                }, {
                    name: gettextCatalog.getString('일정 편집/삭제'),
                    code: 'read_write'
                }, {
                    name: gettextCatalog.getString('캘린더 관리'),
                    code: 'all'
                }],
                defaultPermission: 'read_write'
            },
            DELEGATION: {
                code: 'DELEGATION',
                param: 'private',
                inputPlaceholder: gettextCatalog.getString('위임할 멤버'),
                permissionList: [{
                    name: gettextCatalog.getString('단순 조회'),
                    code: 'opaque_view'
                }, {
                    name: gettextCatalog.getString('조회'),
                    code: 'view'
                }, {
                    name: gettextCatalog.getString('위임'),
                    code: 'read_write'
                }],
                defaultPermission: 'read_write'
            }
        };

        self.ALARM_LIST = CalendarAlarmUtil.ALARM_LIST;


        self.cancel = cancel;
        self.getType = getType;
        self.removeSharedUser = removeSharedUser;
        self.makeSaveParam = makeSaveParam;
        self.checkValidate = checkValidate;
        self.addSharedUser = addSharedUser;

        function cancel() {
            $scope.calendar = null;
            $uibModalInstance.dismiss();
        }

        function getType(type, memberList) {
            if(type === 'private') {
                return self.TYPES[memberList.length > 1 ? 'DELEGATION': 'PRIVATE'];
            }
            return self.TYPES['SHARED'];
        }

        function addSharedUser() {
            var selectedMemberList;

            if(self.selectedMemberList.length === 0) {
                return;
            }

            if(self.selectedMemberList[0].type === 'distributionList') {
                selectedMemberList = [self.selectedMemberList[0].distributionList];
            } else {
                selectedMemberList = TagInputTaskHelper.getUniqMembersFromMemberOrGroups(self.selectedMemberList);
            }

            self.sharedMembers = _(selectedMemberList).map(function (member) {
                return {
                    id: member.id,
                    name: member.name,
                    email: member.email,
                    type: member.type,
                    permission: self.TYPES.SHARED.defaultPermission
                };
            }).reject({id: self.master.id}).concat(self.sharedMembers).uniqBy('id').value();

            self.selectedMemberList = [];
        }

        function removeSharedUser(user) {
            _.remove(self.sharedMembers, {'id': user.id});
        }


        function makeSaveParam() {
            var param = {
                name: $scope.calendar.name,
                type: self.sharedMembers.length === 0 ? self.TYPES.PRIVATE.param : self.TYPES.SHARED.param,
                color: $scope.calendar.color,
                notification: $scope.calendar.notification,
                description: $scope.calendar.description
            };

            if (_.isEmpty(self.sharedMembers)) {
                return param;
            }

            param.calendarMemberList = _.map(self.sharedMembers, makeCalendarMemberParam);

            if(!$scope.ui.update) {
                param = {
                    color: $scope.calendar.color,
                    notification: $scope.calendar.notification
                };
            }

            return param;
        }

        function makeCalendarMemberParam(member) {
            return member.type === 'distributionList' ? {
                type: 'distributionList',
                distributionList: {
                    emailAddress: member.email
                },
                permission: member.permission
            } : {
                type: 'member',
                member: {
                    organizationMemberId: member.id
                },
                permission: member.permission
            };
        }

        function checkValidate() {

            if (HelperFormUtil.checkInvaild($scope[$scope.FORM_NAME])) {
                return;
            }
            return true;
        }

        function init() {
            $scope.FORM_NAME = 'calendarSettingForm';
            HelperFormUtil.bindService($scope, $scope.FORM_NAME);
            self.usedColors = _.map(CalendarRepository.get('calendars'), 'color');
        }

        init();

    }

})();
