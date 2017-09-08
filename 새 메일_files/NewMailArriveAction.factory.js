(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('NewMailArriveAction', NewMailArriveAction);

    /* @ngInject */
    function NewMailArriveAction(API_PAGE_SIZE,
                                 MailFolderUtil, StateHelperUtil,
                                 MailListRepository,
                                 MailResource,
                                 _) {
        return {
            assignNewMailInCurrentMailBoxItemList: assignNewMailInCurrentMailBoxItemList
        };

        function assignNewMailInCurrentMailBoxItemList(folder, mailId) {
            var listStateName = MailFolderUtil.getStateNameByFolder(folder);
            if (StateHelperUtil.computeCurrentListStateName() === listStateName &&
                _.get(StateHelperUtil.getCurrentStateParams(), 'page', 1) === 1) {  //params.page 가 undefined or 1 때만
                return MailResource.get({mailIds: [mailId]}).$promise.then(function (res) {
                    var uniqContents = _.uniqBy(res.contents().concat(MailListRepository.getContents()), 'id');
                    uniqContents.length = Math.min(API_PAGE_SIZE.MAIL, uniqContents.length);
                    MailListRepository.replaceContents(uniqContents);
                    return res;
                });
            }
        }
    }

})();
