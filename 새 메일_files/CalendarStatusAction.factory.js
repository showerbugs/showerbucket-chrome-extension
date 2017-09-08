(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarStatusAction', CalendarStatusAction);

    /* @ngInject */
    function CalendarStatusAction(CalendarScheduleAction, CalendarRepository) {
        return {
            updateDateRange: updateDateRange,
            updateSelectedDate: updateSelectedDate,
            updateSelectCalendarId: updateSelectCalendarId,
            updateIsDoorayView: updateIsDoorayView,
            updateViewType: updateViewType,
            updatePostType: updatePostType
        };


        function updateDateRange(startDate, endDate) {
            CalendarRepository.commit('SET_STATUS', {
                startDate: startDate,
                endDate: endDate
            });
            CalendarScheduleAction.fetchList();
        }

        function updateSelectedDate(selectDate) {
            CalendarRepository.commit('SET_STATUS', {
                selectedDate: selectDate
            });
        }

        function updateSelectCalendarId(id) {
            CalendarRepository.commit('SET_STATUS', {
                selectCalendarId: id
            });
            CalendarScheduleAction.fetchList();
        }

        function updateIsDoorayView(bool) {
            CalendarRepository.commit('SET_STATUS', {
                isDoorayView: bool
            });
        }

        function updateViewType(viewType) {
            CalendarRepository.commit('SET_STATUS', {
                viewType: viewType
            });
        }

        function updatePostType(postType) {
            CalendarRepository.commit('SET_STATUS', {
                postType: postType
            });
            CalendarScheduleAction.fetchList();
        }

    }

})();
