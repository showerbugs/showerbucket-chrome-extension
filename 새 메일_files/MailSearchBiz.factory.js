(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailSearchBiz', MailSearchBiz);

    /* @ngInject */
    function MailSearchBiz(MailDisplayHelperFactory, MailSearchResource, PaginationInstanceFactory, _) {
        var pagination = PaginationInstanceFactory.getOrMakeCommonListPagination();

        function fetchList(params) {
            var param = changeParamToSearchFormat(params);
            var resource = MailSearchResource.search(param);
            return {
                'resource': resource,
                '$promise': resource.$promise.then(function (result) {
                    var mails = result.contents();
                    pagination.setLastPageUsingTotalCnt(result.totalCount);
                    _.forEach(mails, function (value) {
                        MailDisplayHelperFactory.assignDisplayPropertiesInList(value);
                    });
                    return mails;
                })
            };
        }

        function changeParamToSearchFormat(param) {
            var _param = {};
            _param.page = param.page;
            _param.size = param.size;
            _param.scopeFolder = param.scopeFolder;
            var query = param.query;

            if(_.indexOf(['all', 'subject', 'from'], param.field) > -1) {
                _param[param.field] = query;
            } else if(_.indexOf(['to', 'cc'], param.field) > -1) {
                _param[param.field] = {};
                _param[param.field].type = 'include';
                _param[param.field].value = query;
            }
            return _param;
        }

        return {
            fetchList: fetchList
        };

    }

})();
