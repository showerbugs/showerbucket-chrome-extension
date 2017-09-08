(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailsBiz', MailsBiz);

    /* @ngInject */
    function MailsBiz(MailDisplayHelperFactory, MailResource, MailDraftResource, PaginationInstanceFactory, _) {
        var pagination = PaginationInstanceFactory.getOrMakeCommonListPagination();
        return {
            fetchList: fetchList,
            fetchMail: fetchMail,
            removeMail: removeMail,
            removeDraft: removeDraft,
            moveMails: moveMails
        };

        function fetchList(params) {
            var resource = MailResource.get(params);
            return {
                'resource': resource,
                '$promise': resource.$promise.then(function (result) {
                    var mails = result.contents();
                    pagination.setLastPageUsingTotalCnt(result.totalCount());
                    _.forEach(mails, function (value) {
                        MailDisplayHelperFactory.assignDisplayPropertiesInList(value);
                    });
                    return result;
                })
            };
        }

        function fetchMail(params) {
            return MailResource.get(params).$promise;
        }

        function removeMail(params) {
            return MailResource.move(params).$promise;
        }

        function removeDraft(params) {
            return MailDraftResource.remove(params).$promise;
        }

        // option: {targetFolderId: '123123213', targetFolderName: 'inbox'} 2개중에 1개가 필요합니다.
        function moveMails(idList, option) {
            var params = _.assign({mailIdList: idList}, option);

            return MailResource.move(params).$promise;
        }
    }

})();
