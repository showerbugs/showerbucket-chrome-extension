(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailFolderUtil', MailFolderUtil);

    /* @ngInject */
    function MailFolderUtil(MAIL_STATE_NAMES, gettextCatalog, _) {

        var systemFolderStateList = [{
                name: 'inbox',
                stateName: MAIL_STATE_NAMES.INBOX,
                displayName: gettextCatalog.getString('받은 메일함')
            }, {
                name: 'sent',
                stateName: MAIL_STATE_NAMES.SENT_BOX,
                displayName: gettextCatalog.getString('보낸 메일함'),
                forbiddenMailMove: true
            }, {
                name: 'draft',
                stateName: MAIL_STATE_NAMES.DRAFT_BOX,
                displayName: gettextCatalog.getString('임시 보관함.1'),
                forbiddenMailMove: true
            }, {
                name: 'spam',
                stateName: MAIL_STATE_NAMES.SPAM_BOX,
                displayName: gettextCatalog.getString('스팸 메일함')
            }, {
                name: 'trash',
                stateName: MAIL_STATE_NAMES.TRASH_BOX,
                displayName: gettextCatalog.getString('휴지통')
            }, {
                name: 'new',
                stateName: MAIL_STATE_NAMES.NEW_BOX,
                displayName: gettextCatalog.getString('안 읽은 메일')
            }, {
                name: 'important',
                stateName: MAIL_STATE_NAMES.IMPORTANT_BOX,
                displayName: gettextCatalog.getString('별표 메일')
            }, {
                name: 'archive',
                stateName: MAIL_STATE_NAMES.ARCHIVE_BOX,
                displayName: gettextCatalog.getString('보관 메일함')
            }],
            systemFolderGroupByNameMap = _.keyBy(systemFolderStateList, 'name'),
            systemFolderNameList = _.map(systemFolderStateList, 'name'),
            systemFolderStateNameMap = _.keyBy(systemFolderStateList, 'stateName');

        return {
            createDisplaySystemFolders: createDisplaySystemFolders,
            createDisplayUserFoldersTree: createDisplayUserFoldersTree,
            createDisplayAllFoldersFlatten: createDisplayAllFoldersFlatten,
            convertDisplayFolderName: convertDisplayFolderName,
            isSystemFolder: isSystemFolder,
            isUserFolder: isUserFolder,
            isForbiddenMailMoveByStateName: isForbiddenMailMoveByStateName,
            isForbiddenMailMoveByDisplayFolder: isForbiddenMailMoveByDisplayFolder,
            getAllUsedFolderNames: getAllUsedFolderNames,
            getStateNameByFolder: getStateNameByFolder,
            getSystemFolderMapByStateName: getSystemFolderMapByStateName,
            convertDisplaySystemFolderName: convertDisplaySystemFolderName,
            convertDisplayUserLastFolderName: convertDisplayUserLastFolderName
        };

        function createDisplaySystemFolders(systemFolders) {
            return _(systemFolders)
                .map(function (folder) {
                    return _.assign({
                        folder: _.assign({}, folder)
                    }, systemFolderGroupByNameMap[folder.name]);
                }).value();
        }

        function createDisplayUserFoldersTree(userFolders) {
            var itemWrapMap = {};

            // depth 가 작은 순으로 1차 정렬한 후 name 순으로 2차 정렬함 [111, 333, 555, 111/222, 333/444, 111/222/555]
            var sortedUserFolders = _(userFolders).sortBy([function (folder) {
                return folder.name.split('/').length;
            }, function (folder) {
                return folder.name;
            }]).value();

            _.forEach(sortedUserFolders, function (folder) {
                var tokens = folder.name.split('/'),
                    length = tokens.length,
                    displayName = tokens.pop(),
                    parentPath = tokens.join('/');

                itemWrapMap[folder.name] = {
                    folder: _.assign({}, folder),
                    displayName: displayName,
                    depth: length,
                    parentPath: parentPath,
                    editingFlag: false,
                    forbiddenMailMove: false,
                    visibleChildrenFolders: true,
                    children: []
                };

                if (parentPath && itemWrapMap[parentPath]) {
                    itemWrapMap[parentPath].children.push(itemWrapMap[folder.name]);
                }
            });

            //최상위 item 목록을 대상으로 처리함
            return _(sortedUserFolders).filter(function (folder) {
                return !itemWrapMap[folder.name].parentPath;
            }).map(function (folder) {
                return itemWrapMap[folder.name];
            }).value();
        }

        function createDisplayAllFoldersFlatten(systemFolders, userFolders) {
            return createDisplaySystemFolders(systemFolders).concat(_createDisplayUserFoldersFlatten(userFolders));
        }

        function convertDisplayFolderName(folder) {
            return isSystemFolder(folder) ?
                convertDisplaySystemFolderName(folder.name) :
                convertDisplayUserLastFolderName(folder.name);
        }

        function isSystemFolder(folder) {
            return folder.type === 'system';
        }

        function isUserFolder(folder) {
            return folder.type === 'user';
        }

        function isForbiddenMailMoveByStateName(listStateName) {
            return _.get(systemFolderStateNameMap[listStateName], 'forbiddenMailMove') === true;
        }

        function isForbiddenMailMoveByDisplayFolder(displayFolder) {
            return _.get(displayFolder, 'forbiddenMailMove') === true;
        }

        function getAllUsedFolderNames(userFolders) {
            // predefined system folder names and user folder names
            //folder.name 이 $parentPath/$folderName가 있어도 $folderName 는 스팩상 추가될 수 있음 (displayName이 동일해도 됨)
            return _(systemFolderNameList).concat(_.map(userFolders, 'name')).value();
        }

        function getStateNameByFolder(folder) {
            return isUserFolder(folder) ? MAIL_STATE_NAMES.FOLDERS : _.get(systemFolderGroupByNameMap[folder.name], 'stateName');
        }

        function getSystemFolderMapByStateName(listStateName) {
            return systemFolderStateNameMap[listStateName];
        }

        function convertDisplaySystemFolderName(folderName) {   //'inbox' -> '받은 메일함'
            return _.get(systemFolderGroupByNameMap[folderName], 'displayName');
        }

        function convertDisplayUserLastFolderName(userFolderName) {
            return _(userFolderName).split('/').last();
        }

        function _createDisplayUserFoldersFlatten(userFolders) {
            return _.map(userFolders, function (folder) {
                return {
                    displayName: folder.name,
                    folder: folder,
                    editingFlag: false,
                    forbiddenMailMove: false
                };
            });
        }
    }

})();
