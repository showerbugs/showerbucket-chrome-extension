(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailUserFolderValidator', MailUserFolderValidator);

    /* @ngInject */
    function MailUserFolderValidator($q, CheckDuplicatedUtil, MailFolderResource, gettextCatalog, _) {
        var ERROR_MESSAGES = {
            DUPLICATE: gettextCatalog.getString('이미 사용 중입니다.'),
            MAX_OVER_DEPTH: gettextCatalog.getString('하위 메일함은 최대 5단계까지 등록할 수 있습니다.'),
            EMPTY_FOLDER_NAME: gettextCatalog.getString('비어있는 폴더를 만들 수 없습니다.'), //폴더 이름이 없습니다
            PARENT_PATH_IS_INVALID: gettextCatalog.getString('상위 메일함이 존재하지 않습니다.'),
            PARENT_PATH_IS_SOURCE_CHILD: gettextCatalog.getString('자신의 하위 메일함으로 이동할 수 없습니다.')
        };

        return {
            ERROR_MESSAGES: ERROR_MESSAGES,
            validateIsAvailableCreate: validateIsAvailableCreate,
            validateIsAvailableUpdate: validateIsAvailableUpdate,
            validateIsAvailableRemove: validateIsAvailableRemove
        };

        function validateIsAvailableCreate(folderName, allFolderNames) {
            var results = [];
            results.push(_getMessageWhenFolderNameIsEmpty(folderName));
            results.push(_getMessageWhenFolderNameIsDuplicated(folderName, allFolderNames));
            results.push(_getMessageWhenTargetParentIsInvalid(folderName, allFolderNames));
            results.push(_getMessageWhenTargetIsOverMaxDepth(folderName));
            results = _.reject(results, _.isEmpty); //the opposite of _.filter

            return results.length > 0 ? $q.reject(results) : $q.when();
        }

        function validateIsAvailableUpdate(folderParams, allFolderNames) {
            var results = [];
            _(folderParams).forEach(function (param) {
                var folderName = param.name,
                    existedFolderNameList = _(folderParams).map('name').reject(param.name).concat(allFolderNames).value();
                results.push(_getMessageWhenFolderNameIsEmpty(folderName));
                results.push(_getMessageWhenFolderNameIsDuplicated(folderName, allFolderNames));
                results.push(_getMessageWhenTargetParentIsInvalid(folderName, existedFolderNameList));
                results.push(_getMessageWhenTargetParentIsSourceChild(folderName, param.folder.name));
                results.push(_getMessageWhenTargetIsOverMaxDepth(folderName));
            });

            results = _.reject(results, _.isEmpty); //the opposite of _.filter
            return results.length > 0 ? $q.reject(results) : $q.when();
        }

        function validateIsAvailableRemove(folderParams) {
            var params = _.assign({
                page: 0,
                size: 10000
            }, {type: 'user'});
            return MailFolderResource.get(params).$promise.then(function (result) {
                var folderNames = _(folderParams).map('name').value();
                var userFoldersMap =_.keyBy(result.contents(), 'name');
                var foldersTotalCount = _(folderNames).map(function(name){
                    return userFoldersMap[name];
                }).sumBy('totalCount');
                return foldersTotalCount > 0 ? $q.reject() : $q.when();
            });
        }

        function _getMessageWhenFolderNameIsEmpty(folderName) {
            var folderNameTokens = folderName.split('/');
            return (_.isEmpty(folderNameTokens) || !_.every(folderNameTokens, Boolean)) ? ERROR_MESSAGES.EMPTY_FOLDER_NAME : '';
        }

        function _getMessageWhenFolderNameIsDuplicated(folderName, allFolderNames) {
            return CheckDuplicatedUtil.byRawString(allFolderNames, folderName) ? ERROR_MESSAGES.DUPLICATE : '';
        }

        function _getMessageWhenTargetIsOverMaxDepth(folderName) {
            var folderNameTokens = folderName.split('/');
            return folderNameTokens.length > 5 ? ERROR_MESSAGES.MAX_OVER_DEPTH : '';
        }

        function _getMessageWhenTargetParentIsInvalid(folderName, existedFolderNameList) {
            var folderNameTokens = folderName.split('/');
            var parentName = folderNameTokens.slice(0, folderNameTokens.length - 1).join('/');
            return (!_.isEmpty(parentName) && _.indexOf(existedFolderNameList, parentName) === -1) ? ERROR_MESSAGES.PARENT_PATH_IS_INVALID : '';
        }

        function _getMessageWhenTargetParentIsSourceChild(targetName, sourceName) {
            var targetNameTokens = targetName.split('/'), sourceNameTokens = sourceName.split('/');
            return (_.difference(sourceNameTokens, targetNameTokens).length === 0 && targetName.indexOf(sourceName) === 0) ?
                ERROR_MESSAGES.PARENT_PATH_IS_SOURCE_CHILD : '';
        }
    }

})();
