(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailListItemDisplayPartUtil', MailListItemDisplayPartUtil);

    /* @ngInject */
    function MailListItemDisplayPartUtil(MAIL_STATE_NAMES, _) {
        var DEFAULT_DISPLAY_OPTION_MAP = {
            checkbox: true,
            favorite: true,
            from: true,
            subject: true,
            fileCount: true,
            createdAt: true
        };
        var displayOptionMapGroupByStateName = _createDisplayOptionMapGroupByStateName();

        return {
            getOptionsByStateName: getOptionsByStateName
        };

        //분할뷰에서는 메일함별 화면 노출 여부로, 목록뷰에서는 테이블의 각 컬럼별 노출 여부 및 순서를 확인할때 사용
        function getOptionsByStateName(listStateName) {
            return displayOptionMapGroupByStateName[listStateName] || _.assign({}, DEFAULT_DISPLAY_OPTION_MAP);
        }

        function _createDisplayOptionMapGroupByStateName() {
            var displayOptionsByStateName = {};

            displayOptionsByStateName[MAIL_STATE_NAMES.NEW_BOX] = _.assign({}, DEFAULT_DISPLAY_OPTION_MAP, {boxName: true});
            displayOptionsByStateName[MAIL_STATE_NAMES.IMPORTANT_BOX] = _.assign({}, DEFAULT_DISPLAY_OPTION_MAP, {boxName: true});
            displayOptionsByStateName[MAIL_STATE_NAMES.SENT_BOX] = _.assign({}, DEFAULT_DISPLAY_OPTION_MAP, {
                from: false,
                receiptGroup: true,
                receiptUpdatedAt: true
            });
            displayOptionsByStateName[MAIL_STATE_NAMES.DRAFT_BOX] = _.assign({}, DEFAULT_DISPLAY_OPTION_MAP, {
                from: false,
                to: true
            });
            return displayOptionsByStateName;
        }
    }

})();
