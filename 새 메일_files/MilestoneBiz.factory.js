(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('MilestoneBiz', MilestoneBiz);

    /* @ngInject */
    function MilestoneBiz($cacheFactory, API_PAGE_SIZE, AssignMilestoneResource, DateConvertUtil, MilestoneResource, RootScopeEventBindHelper, moment, gettextCatalog, _) {
        var EVENTS = {
            'RESETCACHE': 'MilestoneBiz: resetCache'
        }, EVENT_REASON = {
            ADD: 'addMilestone',
            UPDATE: 'updateMilestone',
            REMOVE: 'removeMilestone',
            ASSIGN_MILESTONE: 'assignMilestone'
        };

        return {
            EVENTS: EVENTS,
            EVENT_REASON: EVENT_REASON,
            resetCache: resetCache,
            convertMilestoneEndDate: convertMilestoneDisplayDate,
            getMilestones: getMilestones,
            getMilestonesForDropdown: getMilestonesForDropdown,
            assignMilestone: assignMilestone,
            addMilestone: addMilestone,
            updateMilestone: updateMilestone,
            removeMilestone: removeMilestone,
            makeDefaultStartedAt: makeDefaultStartedAt,
            getMilestoneTabFilterRule: getMilestoneTabFilterRule
        };

        function resetCache(reason, id) {
            $cacheFactory.get('MilestoneResource').removeAll();
            RootScopeEventBindHelper.emit(EVENTS.RESETCACHE, reason, id);
        }

        function convertMilestoneDisplayDate(date) {
            return date ? DateConvertUtil.parseDateTimeObjectFromIso8601(date, {date: 'YYYY.MM.DD'}).date : '';
        }

        function getMilestones(projectCode, params) {
            params = params || {};
            params.projectCode = projectCode;
            params.size = API_PAGE_SIZE.ALL;
            return MilestoneResource.getWithoutCache(params).$promise.then(function (result) {
                _.forEach(result.contents(), setStartEndDate);

                return result;
            });
        }

        function getMilestonesForDropdown(projectCode, params) {
            params = params || {};
            params.projectCode = projectCode;
            params.size = API_PAGE_SIZE.ALL;
            return MilestoneResource.get(params).$promise.then(function (result) {
                _.forEach(result.contents(), setStartEndDate);
                result.contents().unshift({
                    _displayName: gettextCatalog.getString('없음'),
                    name: gettextCatalog.getString('없음'), id: 'none',
                    _icon: '<span class="glyphicon glyphicon-trash milestone-icon"></span>'
                });
                return result;
            });
        }

        function assignMilestone(projectCode, params) {
            return AssignMilestoneResource.save({projectCode: projectCode}, params).$promise.then(function () {
                // counts수를 갱신하기 위해 resetCache 호출
                resetCache(EVENT_REASON.ASSIGN_MILESTONE);
            });
        }

        function addMilestone(projectCode, params) {
            return MilestoneResource.save({projectCode: projectCode}, [params]).$promise.then(function () {
                resetCache(EVENT_REASON.ADD);
            });
        }

        function updateMilestone(projectCode, milestone, params) {
            var paramsTemplate = {
                name: milestone.name,
                status: milestone.status,
                endedAt: milestone.endedAt,
                startedAt: milestone.startedAt
            };
            return MilestoneResource.update(makePathParam(projectCode, milestone.id), _.assign(paramsTemplate, params)).$promise.then(function () {
                resetCache(EVENT_REASON.UPDATE, milestone.id);
            });
        }

        function removeMilestone(projectCode, milestoneId, options) {
            var params = makePathParam(projectCode, milestoneId);
            if (options) {
                _.assign(params, options);
            }
            return MilestoneResource.remove(params).$promise.then(function () {
                resetCache(EVENT_REASON.REMOVE, milestoneId);
            });
        }

        function makeDefaultStartedAt(milestones) {
            var defaultStartedAt = moment().startOf('day');
            _.forEach(milestones, function (milestone) {
                if (!milestone.endedAt) {
                    return;
                }

                var milestoneEndedAt = moment(milestone.endedAt);
                defaultStartedAt = milestoneEndedAt.isAfter(defaultStartedAt) ?  milestoneEndedAt.add(1, 'day') : defaultStartedAt;
            });
            return defaultStartedAt;
        }

        function getMilestoneTabFilterRule(status) {
            return function (milestone) {
                return milestone.status === status || milestone.id === 'none';
            };
        }

        function makePathParam(projectCode, milestoneId) {
            return {
                projectCode: projectCode,
                milestoneId: milestoneId
            };
        }

        function setStartEndDate(milestone) {
            milestone._getOrSetProp('startDate', convertMilestoneDisplayDate(milestone.startedAt));
            milestone._getOrSetProp('endDate', convertMilestoneDisplayDate(milestone.endedAt));
        }

    }

})();
