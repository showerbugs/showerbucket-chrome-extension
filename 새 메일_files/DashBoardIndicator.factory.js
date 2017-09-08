(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('DashBoardIndicator', DashBoardIndicator);

    /* @ngInject */
    function DashBoardIndicator(_) {
        return {
            setIndicatorValue: function (counts, target) {
                if (_.isEmpty(counts)) {
                    return;
                }
                var postCount = _.get(counts, target) || counts,
                    indicator = {
                        totalClosedPercent: {},
                        registerPostCount: _.get(postCount, 'workflow.registered'),
                        workingPostCount: _.get(postCount, 'workflow.working'),
                        closedPostCount: _.get(postCount, 'workflow.closed'),
                        overduePostCount: _.get(counts, 'dueDate.overdue'),
                        unplannedPostCount: _.get(counts, 'dueDate.unplanned')
                    };

                indicator.totalTaskCount = indicator.registerPostCount + indicator.workingPostCount + indicator.closedPostCount;
                indicator.totalClosedPercent.value = Math.round((indicator.closedPostCount / indicator.totalTaskCount) * 100) || 0;

                return indicator;

            },
            setNotClosedCount: function (list, path) { // working + registerd = (남은 테스크)
                _.forEach(list, function (elem) {
                    var postCount = _.get(elem, path || 'counts.myPostCount', {});
                    var notClosedCount = _.get(postCount, 'workflow.registered', 0) + _.get(postCount, 'workflow.working', 0);
                    elem._getOrSetProp('notClosedTaskCount', notClosedCount);
                });
                return list;
            }
        };
    }

})();
