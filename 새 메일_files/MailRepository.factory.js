(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailRepository', MailRepository)
        .factory('MailSearchFormRepository', MailSearchFormRepository)
        .factory('MailSearchResultRepository', MailSearchResultRepository)
        .factory('MailContentsViewRepository', MailContentsViewRepository)
        .factory('MailStreamViewRepository', MailStreamViewRepository)
        .factory('MailFolderRepository', MailFolderRepository)
        .factory('MailFolderInputRepository', MailFolderInputRepository)
        .factory('MailListRepository', MailListRepository)
        .factory('MailListItemCheckboxRepository', MailListItemCheckboxRepository)
        .factory('MailReceiptRepository', MailReceiptRepository)
        .factory('MailViewRepositoryFactory', MailViewRepositoryFactory);


    /* @ngInject */
    function MailRepository() {
        return {
            someMethod: angular.noop
        };
    }

    /* @ngInject */
    function MailSearchFormRepository(API_PAGE_SIZE, _) {
        var tagModelList = [];
        var paramPage = 1;

        return {
            tagModels: tagModels,
            page: page,
            size: size,
            clear: clear,
            toQueryObject: toQueryObject,
            toUrlParamObject: toUrlParamObject
        };

        function tagModels(_tagModels_) {
            return _.isArray(_tagModels_) ? tagModelList = _.assign([], _tagModels_) : tagModelList;
        }

        function page(_page_) {
            return _.isNumber(_page_) ? paramPage = _page_ : paramPage;
        }

        function size() {
            return API_PAGE_SIZE.MAIL;
        }

        function clear() {
            tagModelList = [];
            paramPage = 1;
        }

        //XHR API
        function toQueryObject() {
            var queryObject = _.reduce(_.groupBy(tagModels(), 'code'), function (result, value, key) {
                result[key] = _.map(value, 'keyword');
                return result;
            }, {});
            queryObject.page = page() - 1;   //URL params.page === 1은 API 요청 0 부터 시작
            queryObject.size = size();
            queryObject.highlight = true;
            return queryObject;
        }

        function toUrlParamObject() {
            var paramObject = {
                query: _.map(tagModels(), function (model) {
                    var result = {};
                    result[model.code] = model.keyword;
                    return angular.element.param(result);
                }).join('&')
            };
            paramObject.page = page();
            return paramObject;
        }
    }

    /* @ngInject */
    function MailSearchResultRepository(HelperPromiseUtil, MailSearchResource) {
        var cachedResource = null,
            contents = [], totalCount = 0;

        return {
            fetchAndCache: fetchAndCache,
            isLoading: isLoading,
            getContents: getContents,
            getTotalCount: getTotalCount,
            clear: clear
        };

        function fetchAndCache(queryObject) {
            clear();
            HelperPromiseUtil.cancelResource(cachedResource);
            cachedResource = MailSearchResource.search(queryObject);
            return cachedResource.$promise.then(function (res) {
                contents = res.contents();
                totalCount = res.totalCount();
                return res;
            });
        }

        function isLoading() {
            return HelperPromiseUtil.isResourcePending(cachedResource);
        }

        function getContents() {
            return contents;
        }

        function getTotalCount() {
            return totalCount;
        }

        function clear() {
            contents = [];
            totalCount = 0;
        }
    }

    /* @ngInject */
    function MailContentsViewRepository(MailViewRepositoryFactory) {
        return MailViewRepositoryFactory.create();
    }

    /* @ngInject */
    function MailStreamViewRepository(MailViewRepositoryFactory) {
        return MailViewRepositoryFactory.create();
    }

    /* @ngInject */
    function MailFolderRepository(MailFolderResource, HelperPromiseUtil, _) {
        var cachedPromiseMap = {};
        var systemFolderContents = [], userFolderContents = [], userFolderMap = {};

        return {
            fetchAndCacheSystemFolders: fetchAndCacheSystemFolders,
            fetchAndCacheUserFolders: fetchAndCacheUserFolders,
            getSystemFolders: getSystemFolders,
            getUserFolders: getUserFolders,
            getUserFolderById: getUserFolderById,
            addUserFolder: addUserFolder,
            updateUserFolder: updateUserFolder,
            removeUserFolder: removeUserFolder
        };

        function fetchAndCacheSystemFolders() {
            HelperPromiseUtil.cancelResource(cachedPromiseMap['fetchAndCacheSystemFolders']);
            cachedPromiseMap['fetchAndCacheSystemFolders'] = _fetchByParams({type: 'system'});
            return cachedPromiseMap['fetchAndCacheSystemFolders'].$promise.then(function (res) {
                systemFolderContents = res.contents();
                return res;
            });
        }

        function fetchAndCacheUserFolders() {
            HelperPromiseUtil.cancelResource(cachedPromiseMap['fetchAndCacheUserFolders']);
            cachedPromiseMap['fetchAndCacheUserFolders'] = _fetchByParams({type: 'user'});
            return cachedPromiseMap['fetchAndCacheUserFolders'].$promise.then(function (res) {
                userFolderContents = res.contents();
                userFolderMap = _.keyBy(userFolderContents, 'id');
                return res;
            });
        }

        function getSystemFolders() {
            return systemFolderContents;
        }

        function getUserFolders() {
            return userFolderContents;
        }

        function getUserFolderById(folderId) {
            return userFolderMap[folderId];
        }

        //params = { "name": "new-folder", "order": "5" }
        function addUserFolder(params) {
            return MailFolderResource.save([params]).$promise.then(function (result) {
                return result;
            });
        }

        //folderId = '1', params = { "name": "renamed-folder-name", "order": 2 }
        function updateUserFolder(folderId, params) {
            return MailFolderResource.update({'folderId': folderId}, params).$promise.then(function (result) {
                return result;
            });
        }

        function removeUserFolder(folderId) {
            return MailFolderResource.remove({'folderId': folderId}).$promise.then(function (result) {
                return result;
            });
        }

        // Private API Implements
        function _fetchByParams(_params_) {
            var params = _.assign({
                page: 0,
                size: 10000
            }, _params_);
            return MailFolderResource.get(params);
        }
    }

    /* @ngInject */
    function MailFolderInputRepository(_) {
        var newInputModel = {}, updateInputModel = {};

        return {
            newInputValue: newInputValue,
            newInputVisible: newInputVisible,
            updateInputValue: updateInputValue,
            updateInputFolder: updateInputFolder,
            cleanNewInputModel: cleanNewInputModel,
            cleanUpdateInputModel: cleanUpdateInputModel
        };

        function newInputValue(value) {
            newInputModel.value = _.isUndefined(value) ? newInputModel.value : value;
            return newInputModel.value;
        }

        function newInputVisible(visible) {
            newInputModel.visible = _.isUndefined(visible) ? newInputModel.visible : visible;
            return newInputModel.visible;
        }

        function updateInputValue(value) {
            updateInputModel.value = _.isUndefined(value) ? updateInputModel.value : value;
            return updateInputModel.value;
        }

        function updateInputFolder(folder) {
            updateInputModel.folder = _.isUndefined(folder) ? updateInputModel.folder : folder;
            return updateInputModel.folder;
        }

        function cleanNewInputModel() {
            newInputModel = {};
        }

        function cleanUpdateInputModel() {
            updateInputModel = {};
        }
    }


    /* @ngInject */
    function MailListRepository(API_PAGE_SIZE,
                                HelperPromiseUtil,
                                MailListItemCheckboxRepository, MailReceiptRepository,
                                MailResource, _) {
        var cachedResource = null,
            cachedParam = {};
        var listContents = [],
            contentsMap = {},
            totalCount;

        return {
            fetchAndCacheWithLoading: fetchAndCacheWithLoading,
            fetchAndCache: fetchAndCache,
            isLoading: isLoading,
            getContents: getContents,
            getContentById: getContentById,
            replaceContents: replaceContents,
            getTotalCount: getTotalCount
        };

        //로딩중 메세지 표시와 함께 목록 및 관련된 리소스를 완전하게 초기화 하도록 함
        function fetchAndCacheWithLoading(param) {
            listContents = [];
            contentsMap = {};
            MailReceiptRepository.clear();
            MailListItemCheckboxRepository.clear();
            HelperPromiseUtil.cancelResource(cachedResource);
            cachedResource = _fetchWithCacheReturnResource(param);
            return cachedResource.$promise;
        }

        //화면 UI-SYNC를 유지하기 위해 데이터를 받아 왔을때만 목록 갱신 및 기존 체크 상태는 존재하는 값에 대해서 그대로 유지 (삭제되었다면 uncheck)
        function fetchAndCache(param) {
            MailReceiptRepository.clear();
            return _fetchWithCacheReturnResource(param).$promise.then(function (result) {
                var checkedMailIdList = _.assign([], MailListItemCheckboxRepository.getCheckedAllItems());
                var currentMailsByIdMap = _(result.contents()).keyBy('id').value();
                _.forEach(checkedMailIdList, function (checkedMailId) {
                    MailListItemCheckboxRepository.toggleCheckItem(checkedMailId, !!currentMailsByIdMap[checkedMailId]);
                });
                return result;
            });
        }

        function isLoading() {
            return HelperPromiseUtil.isResourcePending(cachedResource);
        }

        function getContents() {
            return listContents;
        }

        function getContentById(mailId) {
            return contentsMap[mailId];
        }

        // inline 편집 등을 사용할 때에 리스트를 변경하기 위해 사용
        function replaceContents(mailList) {
            listContents = _.assign([], mailList);  //shallow copy
            contentsMap = _.keyBy(listContents, 'id');
        }

        function getTotalCount() {
            return totalCount;
        }

        function _fetchWithCacheReturnResource(_param) {
            // _param이 없으면 현재 목록과 동일한 조건으로 목록을 갱신하게 하기 위해 캐시
            cachedParam = _.assign({page: 0, size: API_PAGE_SIZE.MAIL}, _param || cachedParam);

            var resource = MailResource.get(cachedParam);
            resource.$promise.then(function (res) {
                listContents = res.contents();

                //TODO 대외비를 위한 모킹 데이터 추가
                //listContents = _.map(listContents, function (content) {
                //    return _.assign({}, content, {
                //        security: {
                //            level: ['normal', 'in_house', 'secret'][Math.floor(Math.random() * 3)],
                //            resend: false,
                //            autoDelete: true,
                //            retentionDays: 30
                //        }
                //        //DRAFT 상태일때만 전달되는 데이터
                //        //securityEditable: true,
                //        //individualSend: false
                //    });
                //});

                contentsMap = _.keyBy(listContents, 'id');
                totalCount = res.totalCount();
                return res;
            });
            return resource;
        }
    }

    /* @ngInject */
    function MailListItemCheckboxRepository(_) {
        var contentsMap = {}, contentsKeyList = [];

        return {
            getCheckedAllItems: getCheckedAllItems,
            toggleCheckAllItems: toggleCheckAllItems,
            isCheckedAllItems: isCheckedAllItems,
            toggleCheckItem: toggleCheckItem,
            isCheckedItem: isCheckedItem,
            clear: clear
        };

        function getCheckedAllItems() {
            return contentsKeyList;
        }

        function toggleCheckAllItems(mailIdList, isChecked) {
            isChecked = _.isBoolean(isChecked) ? isChecked : !isCheckedAllItems(mailIdList);
            _.forEach(mailIdList, function (mailId) {
                contentsMap[mailId] = isChecked;
            });
            contentsKeyList = _filterCheckedIdListFromContentsMap(contentsMap);
        }

        function isCheckedAllItems(mailIdList) {
            return _.isEmpty(mailIdList) ? false : _.every(mailIdList, isCheckedItem);
        }

        function toggleCheckItem(mailId, isChecked) {
            _checkItem(mailId, _.isBoolean(isChecked) ? isChecked : !isCheckedItem(mailId));
        }

        function isCheckedItem(mailId) {
            return !!contentsMap[mailId];
        }

        function clear() {
            contentsMap = {};
            contentsKeyList = [];
        }

        function _checkItem(mailId, isChecked) {
            if (isChecked) {
                contentsMap = _.assign({}, contentsMap);
                contentsMap[mailId] = true;
            } else {
                contentsMap = _.reduce(contentsMap, function (result, value, key) {
                    if (key !== mailId) {
                        result[key] = value;
                    }
                    return result;
                }, {});
            }
            contentsKeyList = _filterCheckedIdListFromContentsMap(contentsMap);
        }

        function _filterCheckedIdListFromContentsMap(contentsMap) {
            return _(contentsMap).map(function (checked, id) {
                return {id: id, checked: checked};
            }).filter({checked: true}).map('id').value();
        }
    }

//보낸 메일함 메일 목록 수신확인 저장
    /* @ngInject */
    function MailReceiptRepository(HelperPromiseUtil, MailReceiptResource, _) {
        var cachedPromise = null,
            contentsMap = {};

        return {
            fetchAndCache: fetchAndCache,
            getContentsMap: getContentsMap,
            getContentById: getContentById,
            removeById: removeById,
            clear: clear
        };

        function fetchAndCache(mailId) {
            HelperPromiseUtil.cancelResource(cachedPromise);
            cachedPromise = MailReceiptResource.get({mailId: mailId});
            return cachedPromise.$promise.then(function (res) {
                contentsMap = _.assign({}, contentsMap);
                contentsMap[mailId] = res.result();
                //TODO 메일 읽지 않음 상태 mocking
                //_.forEach(contentsMap[mailId].references.receiptMap, function(val, key){
                //    val.mailState = 'unread';
                //    val.mailStateUpdatedAt = null;
                //});
                //console.log(contentsMap[mailId]);
                return res;
            });
        }

        function getContentsMap() {
            return contentsMap;
        }

        function getContentById(mailId) {
            return contentsMap[mailId];
        }

        function removeById(mailId) {
            contentsMap = _.reduce(contentsMap, function (result, value, key) {
                if (key !== mailId) {
                    result[key] = value;
                }
                return result;
            }, {});
        }

        function clear() {
            contentsMap = {};
        }
    }

    /* @ngInject */
    function MailViewRepositoryFactory(HelperPromiseUtil, MailResource, urlToHtmlFilter, _) {
        return {
            create: create
        };

        function create() {
            return _createViewRepository();
        }

        function _createViewRepository() {
            var content = {},
                _translationRawContentId = null,
                resourceInstance = null;

            return {
                fetchAndCache: fetchAndCache,
                isLoading: isLoading,
                getContent: getContent,
                replaceContent: replaceContent,
                translationRawContentId: translationRawContentId,
                clear: clear
            };

            function fetchAndCache(param) {
                clear();
                HelperPromiseUtil.cancelResource(resourceInstance);
                resourceInstance = MailResource.get(param);
                return resourceInstance.$promise.then(function (res) {
                    replaceContent(res.contents());
                    return res;
                });
            }

            function isLoading() {
                return HelperPromiseUtil.isResourcePending(resourceInstance);
            }

            function getContent() {
                return content;
            }

            function replaceContent(model) {
                //TODO 대외비를 위한 모킹 데이터 추가
                //model = _.assignIn({}, model, {
                //    security: {
                //        level: ['normal', 'in_house', 'secret'][Math.floor(Math.random() * 3)],
                //        resend: false,
                //        autoDelete: true,
                //        retentionDays: 30
                //    }
                //    //DRAFT 상태일때만 전달되는 데이터
                //    //securityEditable: true,
                //    //individualSend: false
                //});

                content = _.assign({}, model);    //shallow copy
                content._getOrSetProp('displayContent', urlToHtmlFilter(_.get(content, 'body.content')));   //cache for display body content
            }

            function translationRawContentId(id) {
                if (_.isUndefined(id)) {
                    return _translationRawContentId;
                }
                _translationRawContentId = id;
            }

            function clear() {
                content = {};
            }
        }
    }

})
();
