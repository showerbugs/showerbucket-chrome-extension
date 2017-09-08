(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TaskListFilterParamUtil', TaskListFilterParamUtil);

    /* @ngInject */
    function TaskListFilterParamUtil($state, PROJECT_STATE_NAMES, _) {
        var listFilterValueToParamMap = {
            all: null,
            orgCode: null,
            'none': 'null'
        };

        var needSplitParamKeys = ['postWorkflowClass', 'userWorkflowClass', 'tags', 'projectIds'];


        return {
            // 필터와 관련된 parameter 들만 변환하고 나머지는 그대로 반환시켜주는 함수
            convertFilterToParam: function (filterParams) {
                var params = {},
                    listFilterKeyToParamMap = getListFilterKeyToParamMap();

                _.forEach(filterParams, function (value, key) {
                    var paramKey = listFilterKeyToParamMap[key],
                        paramValue = listFilterValueToParamMap[value];
                    if (paramKey) {
                        params[paramKey] = _.isUndefined(paramValue) ?
                            (_.includes(needSplitParamKeys, paramKey) ? value && value.split(',') : value) :
                            paramValue;
                        return;
                    }

                    params[key] = value;
                });

                return params;
            }
        };

        function getListFilterKeyToParamMap() {
            if (!$state.current.data.isContentList || $state.includes(PROJECT_STATE_NAMES.SEARCH_BOX)) {
                return {
                    userWorkflowClass: 'userWorkflowClass',
                    postWorkflowClass: 'postWorkflowClass',
                    dueDate: 'dueDate',
                    from: 'from',
                    to: 'to',
                    cc: 'cc',
                    hasParent: 'hasParent',
                    milestone: 'milestone',
                    tags: 'tags',
                    projectIds: 'projectIds'
                };
            }

            return {
                userWorkflowClass: 'postUserWorkflowClass',
                postWorkflowClass: 'postWorkflowClass',
                dueDate: 'dueDate',
                from: 'postFrom',
                to: 'postTo',
                cc: 'postCc',
                hasParent: 'hasParent',
                milestone: 'milestone',
                tags: 'tags',
                projectIds: 'projectIds'
            };
        }
    }

})();
