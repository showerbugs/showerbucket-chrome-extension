(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailSearchUtil', MailSearchUtil);

    /* @ngInject */
    function MailSearchUtil(gettextCatalog, _) {
        var CODE_LABEL_MAP = {
            all: gettextCatalog.getString('전체'),
            subjects: gettextCatalog.getString('제목'),
            bodies: gettextCatalog.getString('본문'),
            fromList: gettextCatalog.getString('보낸 사람'),
            toList: gettextCatalog.getString('받는 사람'),
            ccList: gettextCatalog.getString('참조자')
            /*fileName: gettextCatalog.getString('파일')*/
        }, CODE_LIST = ['all', 'subjects', 'bodies', 'fromList', 'toList', 'ccList'/*, 'fileName'*/];

        return {
            getSearchFieldList: getSearchFieldList,
            createTagModelsFromQueryString: createTagModelsFromQueryString
        };

        function getSearchFieldList(keyword) {
            return _.trim(keyword) ? _.map(CODE_LIST, function (code) {
                return {label: CODE_LABEL_MAP[code], code: code, keyword: keyword};
            }) : [];
        }

        function createTagModelsFromQueryString(queryString) {
            var modelObjects = _parseQueryString(queryString);
            return _.map(modelObjects, function (model) {
                return _.assign({label: CODE_LABEL_MAP[model.code]}, model);
            });
        }

        function _parseQueryString(queryString) {
            return _.isEmpty(queryString) ? [] : _.map((queryString).split('&'), function (part) {
                var pair = part.split('=');
                return {code: pair[0], keyword: decodeURIComponent(pair[1])};
            });
        }
    }

})();
