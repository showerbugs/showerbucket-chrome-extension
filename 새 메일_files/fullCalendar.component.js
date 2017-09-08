(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .component('fullCalendar', {
            templateUrl: 'modules/calendar/fullCalendar/fullCalendar.html',
            controller: FullCalendarController
        });

    /* @ngInject */
    function FullCalendarController($q, $scope, $element, $window, CalendarScheduleAction, CalendarStatusAction, CalendarRepository, RootScopeEventBindHelper, DigestService, DoorayLazyLoad, CalendarScheduleModal, CalendarDataConverterUtil, CalendarPermissionUtil, SimpleScheduleWriteFormFactory, MessageModalFactory, gettextCatalog, moment, _) {
        var $ctrl = this,
            calendarInstance,
            renderWatchHandler = angular.noop;

        $ctrl.$onInit = function () {
            /* 캘린더 초기화*/
            $ctrl.postType = CalendarRepository.get('status.postType');
            promiseFullCalendarInstance().then(function (calendarInstance) {
                $ctrl.getRenderRangeText = getRenderRangeText;
                $ctrl.moveToToday = moveToToday;
                $ctrl.moveToNextOrPrevRange = moveToNextOrPrevRange;
                $ctrl.changeCalendarViewType = changeCalendarViewType;

                RootScopeEventBindHelper.withScope($scope).on(CalendarRepository.EVENTS.CHANGE_STATE, function (e, stateName, changeStatus) {
                    if (stateName === 'schedules') {
                        calendarInstance.clear();
                        calendarInstance.createEvents(_.map(CalendarRepository.get(stateName), function (schedule) {
                            return CalendarDataConverterUtil.createCalendarModelFromApiModel(schedule);
                        }), true);
                        calendarInstance.render();
                    }

                    if (stateName === 'status') {
                        if (_.includes(changeStatus, "selectedDate")) {
                            calendarInstance.setDate(CalendarRepository.get('status.selectedDate'));
                            DigestService.safeLocalDigest($scope);
                        }

                        if (_.includes(changeStatus, "isDoorayView")) {
                            calendarInstance.toggleDoorayView(CalendarRepository.get('status.isDoorayView'));
                        }
                    }
                });

                renderWatchHandler = $scope.$watch('$ctrl.calendar.renderRange', function (val) {
                    CalendarStatusAction.updateDateRange(new Date(val.start.getTime()), new Date(val.end.getTime()));
                });
            });
        };

        $ctrl.$onDestroy = function () {
            $element.off('click');
            renderWatchHandler();
            angular.element($window).off('resize', _resizeCalendar);
        };

        function getRenderRangeText() {
            var renderRange = calendarInstance.renderRange;
            var start = moment(renderRange.start.getTime());
            var end = moment(renderRange.end.getTime());
            var endFormat = (start.isSame(end, 'year') ? '' : 'YYYY.') + 'MM.DD';

            return start.format('YYYY.MM.DD') + ' - ' + end.format(endFormat);
        }

        function moveToToday() {
            calendarInstance.today();
            CalendarStatusAction.updateSelectedDate(new Date(calendarInstance.renderDate.getTime()));
        }

        function moveToNextOrPrevRange(val) {
            calendarInstance.clear();
            if (val === -1) {
                calendarInstance.prev();
            } else if (val === 1) {
                calendarInstance.next();
            }
        }

        function changeCalendarViewType(viewType) {
            CalendarStatusAction.updateViewType(viewType);
            calendarInstance.toggleView(viewType, true, true);
            calendarInstance.clear();
        }

        function _resizeCalendar() {
            calendarInstance.refresh();
        }

        function _registerCalenderEvent(calendarInstance) {
            // 일정 클릭 이벤트 핸들러
            calendarInstance.on('clickEvent', function (e) {
                if (!e.model.isPending) {
                    CalendarScheduleModal.open(e.model, {}, angular.element(e.jsEvent.target).offset());
                }
            });

            // 드레그로 일정 생성 헨들러
            calendarInstance.on('beforeCreateEvent', function (e) {
                var popupParams = e.isAllDay ? {
                    startedAt: moment(e.starts.getTime()).startOf('date').format(),
                    endedAt: moment(e.ends.getTime()).endOf('date').format(),
                    wholeDayFlag: true
                } : {
                    startedAt: moment(e.starts.getTime()).format(),
                    endedAt: moment(e.ends.getTime()).format()
                };

                _createSimpleWriteForm(calendarInstance, e.guide, popupParams);
            });
            // 드레그로 일정 변경 헨들러
            calendarInstance.on('beforeUpdateEvent', function (e) {
                var schedule = e.model,
                    param = {
                        startedAt: moment(e.starts.getTime()).format(),
                        endedAt: moment(e.ends.getTime()).format()
                    };

                if (!CalendarPermissionUtil.canEditSchedule(schedule.raw._wrap.refMap.calendarMap(schedule.raw.calendarId), schedule.raw)) {
                    MessageModalFactory.alert(gettextCatalog.getString("자신이 등록한 일정이거나, <br/>편집권한이 있는 일정만 수정할 수 있습니다."));
                    return;
                }

                calendarInstance.updateEvent(e.model.id, _.assign(e.model, {
                    starts: e.starts,
                    ends: e.ends,
                    isPending: true
                }));


                if ((schedule.raw.recurrenceId && schedule.raw.recurrenceType === 'unmodified') || schedule.raw.recurrenceType === 'modified') {
                    param.updateType = 'this';
                }
                CalendarScheduleAction.update(schedule.id, param);
            });
        }

        function _createSimpleWriteForm(calendarInstance, guide, param) {
            if (!guide) {
                return;
            }
            var guideEl$ = guide.guideElement ? angular.element(guide.guideElement) : angular.element(guide.guideElements[Object.keys(guide.guideElements)[0]]);
            SimpleScheduleWriteFormFactory.open(guideEl$, param).then(function (resultParam) {
                var createdCalendar = _.find(CalendarRepository.get('calendars'), {id: resultParam.calendarId});
                if (createdCalendar && createdCalendar.checked) {
                    resultParam.isPending = true;
                    calendarInstance.createEvents([CalendarDataConverterUtil.createCalendarModelFromApiModel(resultParam, createdCalendar)]);
                }
            }).finally(function () {
                if (guide.guideElements || SimpleScheduleWriteFormFactory.getOpenCount() <= 0) {
                    guide.clearGuideElement();
                }
                guideEl$ = null;
            });
        }

        function promiseFullCalendarInstance() {
            return DoorayLazyLoad.loadDoorayCalendar().then(function (DoorayCalendar) {
                if (calendarInstance) {
                    return $q.when(calendarInstance);
                }

                var template = {
                    milestone: function (model) {
                        return '<span class="dcon-com-milestone" style="color:' + model.color + '"></span>' +
                            '<span style="color:' + model.color + '">' + model.title + '</span>';
                    },
                    milestoneTitle: function () {
                        return gettextCatalog.getString('마일스톤');
                    },
                    task: function (model) {
                        return model.title;
                    },
                    //TODO 캘린더 코드안으로 넣기
                    taskTitle: function () {
                        var compiled = _.template('<% _.forEach(filters, function(filter) {  %><label><input name="calendar-task-scope" type="radio" value="<%- filter.value %>" <%- filter.checked %>/><%- filter.label %></label><%}); %>');
                        return compiled({
                            filters: [{
                                label: gettextCatalog.getString('담당 업무.1'),
                                value: 'toMe',
                                checked: $ctrl.postType === 'toMe' ? 'checked' : '' //TODO: 개선
                            }, {
                                label: gettextCatalog.getString('전체 업무'),
                                value: '',
                                checked: $ctrl.postType === '' ? 'checked' : ''
                            }]
                        });
                    },
                    alldayTitle: function () {
                        return gettextCatalog.getString('종일');
                    },
                    allday: function (model) {
                        var scheduleTemplate = [model.title];
                        if (!model.raw.wholeDayFlag) {
                            scheduleTemplate.unshift('<strong>', moment(model.raw.startedAt).format('HH:mm'), '</strong> ');
                        }

                        if (model.raw.users && model.raw.users.to && model.raw.users.to.length > 0) {
                            scheduleTemplate.push('<i class="material-icons">person</i>');
                        }

                        if (model.raw.location) {
                            scheduleTemplate.push('<i class="material-icons">place</i>');
                        }

                        if (model.raw.recurrenceId && model.raw.recurrenceType === 'unmodified') {
                            scheduleTemplate.push('<i class="material-icons">cached</i>');
                        }

                        return scheduleTemplate.join('');
                    },
                    time: function (model) {
                        var scheduleTemplate = ['<span class="schedule-info"><strong>', moment(model.starts.getTime()).format('HH:mm'), '</strong> '];

                        if (model.raw.users && model.raw.users.to && model.raw.users.to.length > 0) {
                            scheduleTemplate.push('<i class="material-icons">person</i>');
                        }

                        if (model.raw.location) {
                            scheduleTemplate.push('<i class="material-icons">place</i>');
                        }

                        if (model.raw.recurrenceId && model.raw.recurrenceType === 'unmodified') {
                            scheduleTemplate.push('<i class="material-icons">cached</i>');
                        }

                        scheduleTemplate.push('</span> ');

                        scheduleTemplate.push('<span class="schedule-content">' + model.title);
                        if (model.raw.location) {
                            scheduleTemplate.push(' | ' + model.raw.location);
                        }

                        scheduleTemplate.push('</span>');

                        return scheduleTemplate.join('');
                    }
                };

                calendarInstance = DoorayCalendar.FullCalendar({
                    defaultView: CalendarRepository.get('status.viewType'),
                    week: {panelHeights: [70, 130, 70]},
                    isDoorayView: CalendarRepository.get('status.isDoorayView'),
                    template: template
                }, $element.find('.full-calendar-body')[0]);

                $ctrl.calendar = calendarInstance;

                _registerCalenderEvent(calendarInstance);

                $element.on('click', '[name="calendar-task-scope"]', function (e) {
                    $ctrl.postType = $(e.target).filter(":checked").val();
                    CalendarStatusAction.updatePostType($ctrl.postType);
                });

                angular.element($window).on('resize', _resizeCalendar);

                return $q.when(calendarInstance);
            });
        }
    }
})();


