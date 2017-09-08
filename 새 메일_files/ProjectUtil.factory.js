(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('ProjectUtil', ProjectUtil);

    /* @ngInject */
    function ProjectUtil(PROJECT_STATE_NAMES, gettextCatalog, _) {
        var systemProjectList = [{
            code: gettextCatalog.getString('담당 업무함'),
            state: PROJECT_STATE_NAMES.TO_BOX,
            countPath: 'counts.post.to.unread',
            unreadParam: { read: false, userWorkflowClass: ['all'], page: 1 }
        }, {
            code: gettextCatalog.getString('참조 업무함'),
            state: PROJECT_STATE_NAMES.CC_BOX,
            countPath: 'counts.post.cc.unread',
            unreadParam: { read: false, userWorkflowClass: ['all'], page: 1 }
        }, {
            code: gettextCatalog.getString('보낸 업무함'),
            state: PROJECT_STATE_NAMES.SENT_BOX
        }, {
            code: gettextCatalog.getString('임시 보관함'),
            state: PROJECT_STATE_NAMES.DRAFT_BOX,
            countPath: 'counts.post.draft.total'
        }, {
            code: gettextCatalog.getString('별표 업무'),
            state: PROJECT_STATE_NAMES.IMPORTANT_BOX
        }, {
            code: gettextCatalog.getString('내가 쓴 댓글'),
            state: PROJECT_STATE_NAMES.COMMENT_BOX
        }, {
            code: gettextCatalog.getString('멘션된 업무'),
            state: PROJECT_STATE_NAMES.MENTION_BOX
        }, {
            code: gettextCatalog.getString('검색 결과'),
            state: PROJECT_STATE_NAMES.SEARCH_BOX
        }],
            showSystemProjectList = systemProjectList.slice(0, 4),
            systemProjectStateNameMap = _.keyBy(systemProjectList, 'state');

        return {
            getShowSystemProjectList: getShowSystemProjectList,
            getProjectCodeByStateName: getProjectCodeByStateName
        };

        function getShowSystemProjectList() {
            return showSystemProjectList;
        }

        function getProjectCodeByStateName(listStateName) {
            return _.get(systemProjectStateNameMap[listStateName], 'code');
        }
    }

})();
