(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarRepository', CalendarRepository);



    /* @ngInject */
    function CalendarRepository(CalendarDataConverterUtil, RootScopeEventBindHelper, localStorage, _) {

        var state = {
            calendars: [],
            schedules: [],
            status: {
                startDate: null,
                endDate: null,
                selectedDate: null,
                selectCalendarId: null,
                viewType: 'week', //day, week, month,
                isDoorayView: true,
                postType: _getPostTypeFromLocalStorage()
            }
        };

        var mutations = {
            SET_CALENDARS: function (state, result) {
                _.forEach(result, function (result) {
                    CalendarDataConverterUtil.setCalendarProp(result);
                });
                state.calendars = result;
                _noticeRefreshState('calendars');
            },
            SET_SCHEDULES: function (state, result) {
                state.schedules = result;
                _noticeRefreshState('schedules');
            },
            SET_STATUS: function (state, result) {
                var changeStatusKeys = _getDifferenceKey(state.status, result);
                state.status = _.assign(state.status, result);
                _noticeRefreshState('status', changeStatusKeys);
            }
        };

        var EVENTS = {
            'CHANGE_STATE': 'CalendarRepository:change_state'
        };

        function _noticeRefreshState(stateName, extField) {
            RootScopeEventBindHelper.emit(EVENTS.CHANGE_STATE, stateName, extField);
        }

        return {
            EVENTS: EVENTS,
            get: function (stateName) {
                return _.get(state, stateName, state);
            },
            commit: function (mutation, result){
                mutations[mutation](state, result);
            }
        };

        function _getDifferenceKey(originalObj, obj) {
            return _(obj).pickBy(function(value, key) {
                return value !== originalObj[key];
            }).keys().value();
        }

        function _getPostTypeFromLocalStorage() {
            var localValue = localStorage.getItem('calendar.postType');
            return _.isNull(localValue) ? 'toMe': localValue;
        }
    }

})();
