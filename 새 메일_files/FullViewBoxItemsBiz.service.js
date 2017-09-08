(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .service('FullViewBoxItemsBiz', FullViewBoxItemsBiz)
        .factory('PostFullViewGridItem', PostFullViewGridItem);

    /* @ngInject */
    function FullViewBoxItemsBiz($state, PROJECT_STATE_NAMES, PostFullViewGridItem, StateParamsUtil, gettextCatalog, localStorage, _) {
        var APPEND_KEY = 'view_columns',
            metadataMap = {},
            postExceptionMap = {
                subjectTags: ['subject', 'tags', 'subPost']
            },
            postExceptionKeys = _.keys(postExceptionMap),
            NOTICE_OPTIONS = {
                checkbox: false,
                star: true,
                postBadge: false,
                postCode: false,
                postNumber: true,
                subject: true,
                tags: false,
                from: true,
                to: false,
                subPost: true,
                file: true,
                milestone: false,
                dueDate: false,
                createdAt: false,
                updatedAt: false
            }, version = 0;

        // multiselect 관련 변수들
        var icons = {
            check: '<div class="glyphicon glyphicon-ok"></div>',
            empty: '<div class="glyphicon"></div>'
        };

        var multiSelectMetaData = {
            labelProp: 'name',
            valueProp: 'id',
            tickIconProp: '_icon',
            tickProp: '_ticked',
            translate: {
                defaultOption: gettextCatalog.getString('기본'),
                all: gettextCatalog.getString('전체'),
                postBadge: gettextCatalog.getString('업무 상태'),
                postCode: gettextCatalog.getString('업무 번호'),
                subject: gettextCatalog.getString('제목'),
                tags: gettextCatalog.getString('태그'),
                from: 'From',
                to: 'To',
                subPost: gettextCatalog.getString('하위 업무'),
                file: gettextCatalog.getString('첨부파일'),
                milestone: gettextCatalog.getString('마일스톤'),
                dueDate: gettextCatalog.getString('완료일'),
                createdAt: gettextCatalog.getString('등록일'),
                updatedAt: gettextCatalog.getString('등록일'),//번역으로 인해 등록일로 수정
                priority: gettextCatalog.getString('우선순위')
            }
        };

        return {
            getViewOptions: getViewOptions,
            getColumns: getColumns,
            getVersion: getVersion,
            updateVersion: updateVersion,

            // multiselect 관련 메소드들
            multiSelectMetaData: multiSelectMetaData,
            getSelectableOptionList: getSelectableOptionList,
            selectColumnItem: selectColumnItem
        };

        function getViewOptions(mode) {
            var options = _getMetadata().options;
            return mode !== 'notice' ? options :
                _.assignWith(_.clone(NOTICE_OPTIONS), options, function (value, otherValue) {
                    return value && otherValue;
                });
        }

        function getColumns(mode) {
            if (mode === 'notice') {
                return _getNoticeColumns();
            }

            return _.map(_getPostColumnKeys(), function (key) {
                return PostFullViewGridItem[key];
            });
        }

        function getVersion() {
            return version;
        }

        function updateVersion() {
            version++;
        }

        function getSelectableOptionList() {
            var metadata = _getMetadata(),
                list = [];
            _.forEach(metadata.order, function (key) {
                if (key === 'checkbox' || key === 'star') {
                    return;
                }

                if (!_.includes(postExceptionKeys, key)) {
                    var value = metadata.options[key];
                    if (key === 'postCode') {
                        value = metadata.options[key] || metadata.options['postNumber'];
                    }
                    list.push(_makeSelectableOption(key, value));
                    return;
                }

                _.forEach(postExceptionMap[key], function (_key) {
                    list.push(_makeSelectableOption(_key, metadata.options[_key]));
                });
            });
            list.unshift(_makeSelectableOption('all', _.every(list, multiSelectMetaData.tickProp)));
            list.unshift(_makeSelectableOption('defaultOption', _isDefaultOption(metadata.options)));
            return list;
        }

        function selectColumnItem(item, allColumns) {
            _setDisplayColumnItem(item, allColumns);
            var metadata = _makeMetadata(allColumns);
            _setDefaultOptionBtn(metadata.options, allColumns);
            _setMetadata(metadata);
            updateVersion();
        }

        function _makeSelectableOption(key, value) {
            var item = {};
            item[multiSelectMetaData.labelProp] = multiSelectMetaData.translate[key];
            item[multiSelectMetaData.valueProp] = key;
            item[multiSelectMetaData.tickIconProp] = icons[value ? 'check' : 'empty'];
            item[multiSelectMetaData.tickProp] = !!value;
            return item;
        }

        function _makeMetadata(allColumns) {
            var metadata = _getMetadata(),
                options = {};

            _.forEach(allColumns, function (column) {
                if (column.id === 'all' || column.id === 'defaultOption') {
                    return;
                }
                var key = column.id;

                if (column.id === 'postCode') {
                    key = $state.includes(PROJECT_STATE_NAMES.PROJECT_BOX) ? 'postNumber' : 'postCode';
                }

                options[key] = column[multiSelectMetaData.tickProp];
            });
            _.assign(metadata.options, options);
            return metadata;
        }

        function _setDefaultOptionBtn(options, allColumns) {
            var defaultColumn = allColumns[0],
                isDefaultOption = _isDefaultOption(options);
            _checkColumn(defaultColumn, isDefaultOption);
        }

        function _checkColumn(column, isCheck) {
            column[multiSelectMetaData.tickProp] = isCheck;
            column[multiSelectMetaData.tickIconProp] = icons[isCheck ? 'check': 'empty'];
        }

        function _setDisplayColumnDefaultOption(allColumns) {
            var defaultOptions = $state.current.data.defaultFullViewCols.options;
            _.forEach(allColumns, function (column) {
                if (column.id === 'all' || column.id === 'defaultOption') {
                    return;
                }

                var key = column[multiSelectMetaData.valueProp];
                if (column.id === 'postCode') {
                    key = $state.includes(PROJECT_STATE_NAMES.PROJECT_BOX) ? 'postNumber' : 'postCode';
                }

                _checkColumn(column, !!defaultOptions[key]);
            });
            _checkColumn(allColumns[1], _isCheckedAll(allColumns));
        }

        function _setDisplayColumnItem(item, allColumns) {
            if (item.id === 'all') {
                _setAllCheck(allColumns, !_isCheckedAll(allColumns));
                return;
            } else if (item.id === 'defaultOption') {
                _setDisplayColumnDefaultOption(allColumns);
                return;
            }
            var iconName = item[multiSelectMetaData.tickProp] ? 'check' : 'empty';
            _.find(allColumns, {'id': item.id})[multiSelectMetaData.tickIconProp] = icons[iconName];
            allColumns[1][multiSelectMetaData.tickIconProp] = icons[_isCheckedAll(allColumns) ? 'check' : 'empty'];
        }

        function _isDefaultOption(options) {
            return _.isEqual($state.current.data.defaultFullViewCols.options, options);
        }

        function _isCheckedAll(allColumns) {
            return _(allColumns).filter(function (column) {
                return column.id !== 'all' && column.id !== 'defaultOption';
            }).every('_ticked');
        }

        function _setAllCheck(allColumns, isCheck) {
            return _(allColumns).filter(function (column) {
                return column.id !== 'defaultOption';
            }).forEach(function (column) {
                _checkColumn(column, isCheck);
            });
        }

        function _getNoticeColumns() {
            var noticeKeys = ['star', 'postCode', 'subjectTags', 'from'];
            return _.map(_getPostColumnKeys(), function (key) {
                if (key === 'postBadge') {
                    return _.assign({}, PostFullViewGridItem[key], PostFullViewGridItem.notice);
                }

                return _.includes(noticeKeys, key) ? PostFullViewGridItem[key]
                    : _.assign({}, PostFullViewGridItem[key], PostFullViewGridItem.empty);
            });
        }

        function _getPostColumnKeys() {
            /*  default metadata in post
             options: {
                 checkbox: true,
                 star: true,
                 postBadge: true,
                 postCode: 'postCode',
                 postNumber: false,
                 subject: true,
                 tags: true,
                 from: true,
                 to: true,
                 subPost: true,
                 file: true,
                 milestone: true,
                 dueDate: true,
                 createdAt: true,
                 updatedAt: false
             },
             order: ['checkbox', 'star', 'postCode', 'postBadge', 'subjectTags', 'from', 'to', 'priority', 'createdAt', 'dueDate', 'milestone']
             * */
            var metadata = _getMetadata(),
                colKeys = [];
            _.forEach($state.current.data.defaultFullViewCols.order, function (key) {
                if (key === 'postCode') {
                    if (metadata.options.postCode) {
                        colKeys.push('postCode');
                    } else if (metadata.options.postNumber) {
                        colKeys.push('postNumber');
                    }
                    return;
                }

                if (_canInsertPostColumn(key, metadata.options)) {
                    colKeys.push(key);
                }
            });

            if (!metadata.options.subject && !metadata.options.tags) {
                colKeys.push('dummy');
            }
            return colKeys;
        }

        function _canInsertPostColumn(key, options) {
            if (!_.includes(postExceptionKeys, key)) {
                return options[key];
            }
            return _.some(postExceptionMap[key], function (_key) {
                return options[_key];
            });
        }

        function _setMetadata(metadata) {
            var key = StateParamsUtil.getFilterUniqueKey(APPEND_KEY);
            metadataMap[key] = metadata;
            localStorage.setItem(key, angular.toJson(metadata));
        }

        function _getMetadata() {
            var key = StateParamsUtil.getFilterUniqueKey(APPEND_KEY);
            if (metadataMap[key]) {
                return metadataMap[key];
            }

            var metadata = localStorage.getItem(key);
            metadata = metadata ? angular.fromJson(metadata) : _.cloneDeep($state.current.data.defaultFullViewCols);
            metadataMap[key] = metadata;
            return metadata;
        }
    }

    /* @ngInject */
    function PostFullViewGridItem(gettextCatalog) {
        return {
            checkbox: {
                field: 'checkbox',
                displayName: '',
                cellTemplate: 'modules/components/doorayFullViewGrid/commonContents/checkboxItem.html',
                width: 35
            },
            star: {
                field: 'star',
                displayName: '',
                cellTemplate: 'modules/components/doorayFullViewGrid/commonContents/favoriteItem.html',
                width: 24
            },
            postBadge: {
                field: 'postBadge',
                displayName: '',
                cellTemplate: 'modules/project/list/TaskList/fullListContent/workflowBadgeItem.html',
                width: 27
            },
            postCode: {
                field: 'postCode',
                displayName: gettextCatalog.getString('번호'),
                cellTemplate: 'modules/project/list/TaskList/fullListContent/postCodeItem.html',
                width: 100
            },
            postNumber: {
                field: 'postNumber',
                displayName: gettextCatalog.getString('번호'),
                cellTemplate: 'modules/project/list/TaskList/fullListContent/postCodeItem.html',
                width: 100
            },
            subjectTags: {
                field: 'subjectTags',
                displayName: gettextCatalog.getString('제목'),
                cellTemplate: 'modules/project/list/TaskList/fullListContent/subjectTagsItem.html',
                width: '*',
                minWidth: 300
            },
            dueDate: {
                field: 'dueDate',
                displayName: gettextCatalog.getString('완료일'),
                cellTemplate: 'modules/project/list/TaskList/fullListContent/dueDateItem.html',
                width: 120
            },
            from: {
                field: 'from',
                displayName: 'From',
                cellTemplate: 'modules/project/list/TaskList/fullListContent/fromItem.html',
                width: '7%',
                minWidth: 74
            },
            to: {
                field: 'to',
                displayName: 'To',
                cellTemplate: 'modules/project/list/TaskList/fullListContent/toItem.html',
                width: '8%',
                minWidth: 85
            },
            milestone: {
                field: 'milestone',
                displayName: gettextCatalog.getString('마일스톤'),
                cellTemplate: 'modules/project/list/TaskList/fullListContent/milestoneItem.html',
                width: '6%'
            },
            priority: {
                field: 'priority',
                displayName: gettextCatalog.getString('우선순위'),
                cellTemplate: 'modules/project/list/TaskList/fullListContent/priorityItem.html',
                width: '57'
            },
            createdAt: {
                field: 'createdAt',
                displayName: gettextCatalog.getString('등록일'),
                cellTemplate: 'modules/project/list/TaskList/fullListContent/createdAtItem.html',
                minWidth: 74,
                maxWidth: 82,
                width: '6%'
            },
            updatedAt: {
                field: 'updatedAt',
                displayName: gettextCatalog.getString('등록일'), //번역으로 인해 등록일로 수정
                cellTemplate: 'modules/project/list/TaskList/fullListContent/updatedAtItem.html',
                minWidth: 74,
                maxWidth: 82,
                width: '6%'
            },
            empty: {
                cellTemplate: 'modules/project/list/TaskList/fullListContent/emptyItem.html'
            },
            dummy: {
                field: 'dummy',
                displayName: '',
                cellTemplate: 'modules/project/list/TaskList/fullListContent/emptyItem.html',
                width: '100%'
            },
            shortDummy: {
                field: 'shortDummy',
                displayName: '',
                cellTemplate: 'modules/project/list/TaskList/fullListContent/emptyItem.html',
                width: 20
            },
            shortDummy2: {
                field: 'shortDummy2',
                displayName: '',
                cellTemplate: 'modules/project/list/TaskList/fullListContent/emptyItem.html',
                width: 20
            },
            notice: {
                cellTemplate: 'modules/project/list/TaskList/fullListContent/noticeItem.html'
            }
        };
    }

})();
