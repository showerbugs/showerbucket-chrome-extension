(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarApiBiz', CalendarApiBiz);

    /* @ngInject */
    function CalendarApiBiz($cacheFactory, CalendarResource, CalendarDataConverterUtil, RootScopeEventBindHelper, _) {
        var EVENTS = {
            'RESETCACHE': 'CalendarApiBiz:resetCache'
        };

        return {
            EVENTS: EVENTS,
            resetCache: resetCache,
            fetchList: fetchList,
            save: save,
            update: update,
            remove: remove,
            getFreebusyTime: getFreebusyTime,
            setColor: setColor,
            setList: setList,
            setChecked: setChecked
        };

        function resetCache() {
            $cacheFactory.get('CalendarResource').removeAll();
            RootScopeEventBindHelper.emit(EVENTS.RESETCACHE);
        }

        function fetchList(param) {
            return CalendarResource.get(param).$promise.then(function (result) {
                if (_.isArray(result.contents())) {
                    _.forEach(result.contents(), function (calendar) {
                        CalendarDataConverterUtil.setCalendarProp(calendar);
                    });
                } else {
                    CalendarDataConverterUtil.setCalendarProp(result.contents());
                }
                return result;
            });
        }

        function save(param) {
            resetCache();
            return CalendarResource.save([param]).$promise;
        }

        function update(calendarId, param) {
            resetCache();
            return CalendarResource.update({calendarId: calendarId}, param).$promise;
        }

        function remove(calendarId) {
            resetCache();
            return CalendarResource.delete({calendarId: calendarId}).$promise;
        }

        function getFreebusyTime(param) {
            return CalendarResource.freebusy(param).$promise;
        }

        function setColor(calendarId, color) {
            resetCache();
            return CalendarResource.setColor({calendarId: calendarId},
                {color: color}).$promise;
        }

        function setList(calendarId, listed) {
            resetCache();
            return CalendarResource.setList({calendarId: calendarId},
                {listed: listed}).$promise;
        }

        function setChecked(calendarId, checked) {
            resetCache();
            return CalendarResource.setChecked({calendarId: calendarId},
                {checked: checked}).$promise;
        }
    }

})();
