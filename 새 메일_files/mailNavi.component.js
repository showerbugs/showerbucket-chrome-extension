(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailNavi', {
            templateUrl: 'modules/mail/navi/mailNavi/mailNavi.html',
            controller: MailNavi
        });

    /* @ngInject */
    function MailNavi($q, MailCountRepository, MailFolderRepository, PopupUtil) {
        var $ctrl = this;

        $ctrl.openMailWritePopup = openMailWritePopup;
        $ctrl.MailFolderRepository = MailFolderRepository;

        ////// life cycle call back;
        $ctrl.$onInit = function () {
            //페이지 최초 로딩 시 BodyContainerCtrl 에서 CountsService.fetchCount() 한번 호출 해 주지만 (프로젝트 <-> 메일 전환 시)에도 업데이트 하도록 함
            _fetchFoldersWithCounts();
        };

        ////// bind to $ctrl functions
        function openMailWritePopup() {
            PopupUtil.openMailWritePopup('new');
        }

        ////// private functions
        function _fetchFoldersWithCounts() {
            return $q.all([
                MailFolderRepository.fetchAndCacheSystemFolders(),
                MailFolderRepository.fetchAndCacheUserFolders(),
                MailCountRepository.fetchAndCache()]);
        }

    }

})();
