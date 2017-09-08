(function () {

    'use strict';

    angular
        .module('doorayWebApp.layout')
        .service('NoticeSummaryService', NoticeSummaryService);

    /* @ngInject */
    function NoticeSummaryService($timeout, PROJECT_STATE_NAMES, gettextCatalog) {
        var self = this;
        this.msg = '';

        this.resetMessage = resetMessage;
        this.showCompletePostsMsg = showCompletePostsMsg;
        this.showRemovePostsMsg = showRemovePostsMsg;
        this.showChangeMilestoneMsg = showChangeMilestoneMsg;
        this.showChangeTagMsg = showChangeTagMsg;
        this.showChangeProjectMsg = showChangeProjectMsg;

        function resetMessage() {
            self.msg = '';
        }

        function showCompletePostsMsg() {
            _showMsg(gettextCatalog.getString('업무가 완료되었습니다.'));
        }

        function showRemovePostsMsg() {
            _showMsg(gettextCatalog.getString('업무가 삭제되었습니다.'));
        }

        function showChangeMilestoneMsg() {
            _showMsg(gettextCatalog.getString('마일스톤이 변경되었습니다.'));
        }

        function showChangeTagMsg() {
            _showMsg(gettextCatalog.getString('태그가 변경되었습니다.'));
        }

        function showChangeProjectMsg(projectCode) {
            _showMsg(gettextCatalog.getString('<a ui-sref="{{::projectState}}({projectCodeFilter: {{::projectCode}}})" ui-sref-opts="{reload: {{::projectState}}}">{{::projectCode}}</a> 으로 이동하였습니다.',
                {projectCode: projectCode, projectState: PROJECT_STATE_NAMES.PROJECT_BOX}));
        }

        function _showMsg(msg) {
            self.msg = '';
            $timeout(function () {
                self.msg = msg;
            });
        }
    }

})();
