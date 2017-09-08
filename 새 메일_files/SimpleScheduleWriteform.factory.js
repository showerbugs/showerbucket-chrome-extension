(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('SimpleScheduleWriteFormFactory', SimpleScheduleWriteFormFactory)
        .component('simpleScheduleWriteform', {
            templateUrl: 'modules/calendar/components/SimpleScheduleWriteForm/simpleScheduleWriteform.html',
            controller: SimpleScheduleWriteFormctrl,
            bindings: {
                param: '<',
                onSubmit: '&',
                onClose: '&'
            }
        });

    /* @ngInject */
    function SimpleScheduleWriteFormFactory($q, $document, $window, $compile, $timeout, $rootScope) {
        var content = '<div class="popover top simple-schedule-writeform" role="tooltip"><div class="arrow"></div>' +
                '<div class="popover-content"><simple-schedule-writeform param="param" on-submit="submit(param)" on-close="close()"></simple-schedule-writeform></div></div>',
            CONTENT_HEIGHT = 199,
            CONTENT_WIDTH = 414,
            LEFT_MARGIN = 3,
            openCount = 0;


        function open(guideEl$, param) {
            var deferred = $q.defer(),
                newScope = $rootScope.$new(true),
                writeForm$,
                guideLeft = guideEl$.offset().left,
                guideTop = guideEl$.offset().top,
                writeFormTop = guideTop - CONTENT_HEIGHT,
                writeFormLeft = guideLeft - CONTENT_WIDTH / 2 + guideEl$.width() / 2,
                documentWidth = $document.width();

            //TODO: angular bootstrap 버전 업하면 component로 대체하면서 삭제

            openCount += 1;
            newScope.param = param;
            newScope.submit = resolve;
            newScope.close = close;

            writeForm$ = $compile(content)(newScope);
            writeForm$.appendTo($document[0].body);

            if (guideLeft + CONTENT_WIDTH > documentWidth) {
                writeFormLeft = guideLeft - CONTENT_WIDTH + guideEl$.width() - LEFT_MARGIN;
                writeForm$.find('.arrow').css('left', '80%');
            }

            if (writeFormTop < 0) {
                writeFormTop = guideTop + guideEl$.height();
                writeForm$.removeClass('top').addClass('bottom');
            }

            writeForm$.offset({top: writeFormTop, left: writeFormLeft});
            writeForm$.show().promise().done($timeout(function () {
                $document.on('click', onClickOutside);
            }, 0, false));
            angular.element($window).on('resize', destroy);

            function resolve(param) {
                destroy();
                deferred.resolve(param);
            }

            function close() {
                destroy();
                deferred.reject();
            }

            function destroy() {
                openCount -= 1;
                $document.off('click', onClickOutside);
                angular.element($window).off('resize', destroy);
                writeForm$.remove();
                writeForm$ = null;
                newScope.$destroy();
                newScope = null;
            }

            function onClickOutside(e) {
                var $target = angular.element(e.target);

                if ($target.is(":visible") && writeForm$.is(":visible") && !$target.closest('.simple-schedule-writeform, .dooray-calendar-time-guide-creation, body.modal-open').length && writeForm$.is(":visible")) {
                    close();
                }
            }

            return deferred.promise;
        }

        return {
            open: open,
            getOpenCount: function () {
                return openCount;
            }
        };
    }

    /* @ngInject */
    function SimpleScheduleWriteFormctrl(CalendarScheduleAction, CalendarRepository, PopupUtil, DateConvertUtil, CalendarPermissionUtil) {
        var $ctrl = this;

        $ctrl.alert = {
            dateRange: false,
            invalidDate: false
        };

        $ctrl.$onInit = function () {
            $ctrl.calenderList = _(CalendarRepository.get('calendars')).filter('listed').filter(CalendarPermissionUtil.canCreateSchedule).value();
            $ctrl.selectedCalendar = _.find($ctrl.calenderList, {id: CalendarRepository.get('status.selectCalendarId')}) || _.find($ctrl.calenderList, 'checked') || $ctrl.calenderList[0];
        };
        $ctrl.param.category = 'general';
        $ctrl.param.autoFreebusy = true;

        $ctrl.submit = function () {
            if (!$ctrl.param.subject) {
                return;
            }
            var form = _makeScheduleFormParam();
            if (!_validateForm(form)) {
                return;
            }

            CalendarScheduleAction.save(form);
            $ctrl.onSubmit({param: form});
        };

        $ctrl.openWriteformPopup = function () {
            $ctrl.param.calendarId = $ctrl.selectedCalendar.id;
            PopupUtil.openCalendarWritePopup('new', $ctrl.param);
            $ctrl.onClose();
        };

        $ctrl.onKeyDown = function (e) {
            if (e.keyCode === 27) {
                $ctrl.onClose();
            }
        };

        function _makeScheduleFormParam() {
            return {
                "body": {
                    "mimeType": "text/x-markdown",
                    "content": ""
                },
                "wholeDayFlag": $ctrl.param.wholeDayFlag,
                "category": 'general',
                "subject": $ctrl.param.subject,
                "calendarId": $ctrl.selectedCalendar.id,
                "startedAt": $ctrl.param.startedAt,
                "endedAt": $ctrl.param.endedAt,
                "users": {}
            };
        }

        function _validateForm(form) {
            if (!DateConvertUtil.isValidDate(form.startedAt) || !DateConvertUtil.isValidDate(form.endedAt)) {
                $ctrl.alert.invalidDate = true;
                return;
            }
            if (!form.wholeDayFlag && moment(form.startedAt).isAfter(form.endedAt)) {
                $ctrl.alert.dateRange = true;
                return;
            }

            if (form.wholeDayFlag && moment(form.startedAt).isAfter(form.endedAt, 'day')) {
                $ctrl.alert.dateRange = true;
                return;
            }

            return true;
        }
    }

})();
