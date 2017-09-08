(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .component('freebusy', {
            templateUrl: 'modules/calendar/components/freebusy/freebusy.html',
            controller: FreebusyController,
            bindings: {
                myInfo: '<',
                users: '<',
                duration: '<',
                startTime: '<',
                endTime: '<',
                isAutoSetFreebusy: '=',
                setTime: '&'
            }
        });

    /* @ngInject */
    function FreebusyController($q, $scope, $compile, $element, $templateCache, DoorayLazyLoad, CalendarApiBiz, TagInputTaskHelper, _) {
        var $ctrl = this;
        var freebusyInstance;
        var memberTitleCompiler = _.template($templateCache.get('modules/calendar/components/freebusy/freebusyMember.html'));

        $ctrl.$onChanges = function (change) {
            if (change.duration) {
                $ctrl.duration = parseInt(change.duration.currentValue, 10);
            }

            if (change.users) {
                $ctrl.memberList = getMemberList(change.users.currentValue);
            }

            if (change.startTime || change.endTime) {
                promiseFreeBusyCalendarInstance().then(function (freebusy) {
                    freebusy.select(moment($ctrl.startTime).format('HH:mm'), moment($ctrl.endTime).format('HH:mm'));
                });
            }

            if (change.startTime) {
                $ctrl.currentTimeMoment = moment(change.startTime.currentValue);
                if (moment(change.startTime.currentValue).isSame(change.startTime.previousValue, 'day')) {
                    return;
                }
            }

            fetchFreebusy();
        };

        $ctrl.moveDay = function (unit) {
            $ctrl.currentTimeMoment.add(unit, 'days');
            fetchFreebusy(true);
        };

        $ctrl.expandView = function () {
            $ctrl.isExpandMode = !$ctrl.isExpandMode;
        };

        var groupMemberHandler = $scope.$watchCollection(function () {
            //CanlendarWriteform에서 그룹 불러오는 api가 호출되서 그룹 정보가 들어 올 때 까지
            return _($ctrl.users).filter({type: 'group'}).map('group.members').value();
        }, function () {
            $ctrl.memberList = getMemberList($ctrl.users);
            fetchFreebusy();
        });

        $ctrl.$onDestroy = function () {
            groupMemberHandler();
        };

        function fetchFreebusy(isOnlyFetch) {
            if ($ctrl.memberList.length === 1) {
                return;
            }
            CalendarApiBiz.getFreebusyTime({
                timeMin: $ctrl.currentTimeMoment.startOf('date').format(),
                timeMax: $ctrl.currentTimeMoment.clone().add(14, 'days').endOf('date').format(),
                to: _($ctrl.memberList).map('id').compact().value().join(','),
                duration: $ctrl.duration
            }).then(function (result) {
                promiseFreeBusyCalendarInstance().then(function (freebusy) {
                    freebusy.clear();

                    var free = result.contents().free || [];
                    if ($ctrl.isAutoSetFreebusy && free.length > 0 && !isOnlyFetch) {
                        $ctrl.currentTimeMoment = moment(free[0].starttime);
                        selectTime(moment(free[0].starttime).format('HH:mm'), moment(free[0].endtime).format('HH:mm'));
                    }
                    _setBusy(freebusy, result.contents().busy);
                    _setFree(freebusy, free);
                });

            });
        }

        function getMemberList(users) {
            return TagInputTaskHelper.getUniqMembersFromMemberOrGroups(users).concat($ctrl.myInfo);
        }


        function selectTime(startTime, endTime) { //HH:mm format
            var currentDayFormat = $ctrl.currentTimeMoment.format('YYYY-MM-DD');
            $ctrl.setTime({
                startedAt: currentDayFormat + ' ' + startTime,
                endedAt: currentDayFormat + ' ' + endTime
            });
        }

        function _setFree(freebusy, free) {
            if ($ctrl.currentTimeMoment.isSame($ctrl.startTime, 'day')) {
                freebusy.select(moment($ctrl.startTime).format('HH:mm'), moment($ctrl.endTime).format('HH:mm'));
            }

            if (free.length && $ctrl.currentTimeMoment.isSame(free[0].starttime, 'day') && $ctrl.currentTimeMoment.isSame($ctrl.startTime, 'day')) {
                freebusy.addRecommends({
                    from: free[0].starttime,
                    to: free[0].endtime
                });

            }
        }

        function _setBusy(freebusy, busy) {
            freebusy.addUsers(_.map($ctrl.memberList, function (member) {
                var busyTimes = _.chain(busy).find({organizationMemberId: member.id}).get('busy').value();
                return {
                    id: member.id,
                    name: member.name,
                    freebusy: filterDaySchedule($ctrl.currentTimeMoment, busyTimes),
                    profileImage: member.profileImage,
                    emailAddress: member.emailAddress
                };
            }));
        }

        function filterDaySchedule(momentDay, busyTimes) {
            return _(busyTimes).filter(function (schedule) {
                var start = moment(schedule.starttime),
                    end = moment(schedule.endtime);
                if (start.isSame(momentDay, 'day') && end.isSame(momentDay, 'day')) { //일정이 같은날
                    return true;
                } else if (end.isSame(momentDay, 'day')) { //전날에 시작해서 오늘 끝남
                    schedule.starttime = momentDay.startOf('day').format();
                    return true;
                } else if (start.isSame(momentDay, 'day')) { //오늘 시작해서 나중에 끝남
                    schedule.endtime = momentDay.endOf('day').format();
                    return true;
                } else if (start.isBefore(momentDay) && end.isAfter(momentDay)) { //일정에 오늘이 껴있음
                    schedule.starttime = momentDay.startOf('day').format();
                    schedule.endtime = momentDay.endOf('day').format();
                    return true;
                }
            }).map(function (schedule) {
                return {
                    from: schedule.starttime,
                    to: schedule.endtime
                };
            }).value();
        }

        function promiseFreeBusyCalendarInstance() {
            return DoorayLazyLoad.loadDoorayCalendar().then(function (DoorayCalendar) {
                if (freebusyInstance) {
                    return $q.when(freebusyInstance);
                }

                freebusyInstance = new DoorayCalendar.Freebusy({
                    template: {
                        title: function (model) {
                            return memberTitleCompiler(model);
                        }
                    }
                }, $element.find('.writeform-freebusy')[0]);

                freebusyInstance.on('click', function (e) {
                    var startTime = e.time,
                        endTime = moment(e.time, 'HH:mm').add(parseInt($ctrl.duration, 10), 'minutes').format('HH:mm');
                    selectTime(startTime, endTime);
                    $ctrl.isAutoSetFreebusy = false;
                });

                freebusyInstance.on('mousemove', function (e) {
                    var startTime = e.time,
                        endTime = moment(e.time, 'HH:mm').add(parseInt($ctrl.duration, 10), 'minutes').format('HH:mm');
                    freebusyInstance.selectOver(startTime, endTime);
                });

                freebusyInstance.on('afterRender', function () {
                    $compile($element.find('.writeform-freebusy'))($scope);
                });

                return $q.when(freebusyInstance);
            });
        }
    }

})();


