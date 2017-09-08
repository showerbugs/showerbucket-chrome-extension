(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .service('CommonItemList', CommonItemList);

    /* @ngInject */
    function CommonItemList($filter, $state, API_PAGE_SIZE, PROJECT_STATE_NAMES, POPUP_STATE_NAMES, DigestService, HelperPromiseUtil, PaginationInstanceFactory, PostListWithContentBiz, ListBizWrapperByType, MessageModalFactory, NoticeTaskList, StateParamsUtil, TaskListFilterParamUtil, gettextCatalog, _) {
        var items = [],
            totalCount = 0,
            groupFilter = [],
            loading = false,
            pagination = PaginationInstanceFactory.getOrMakeCommonListPagination(),
            prevFetchListResource = null,
            isTaskDraftList = false,
            paramsForState = {};    // 업무를 클릭하면 기존에 호출했던 API를 그대로 호출해야하므로 캐시

        return {
            getItemSize: function () {
                return items.length;
            },
            getItems: function () {
                return items;
            },
            getLoading: function () {
                return loading;
            },
            getTotalCount: function () {
                return totalCount;
            },
            setGroupFilter: function (_groupFilter) {
                groupFilter = _groupFilter;
            },
            getCallListApiParams: function () {
                return makeParams();
            },
            init: init,
            stateGoWithoutReload: stateGoWithoutReload,
            removeItems: removeItems,
            replaceItem: replaceItem,
            applyFunction: applyFunction,
            onErrorWhileRemoving: onErrorWhileRemoving,
            addSimplePost: addSimplePost,
            findItemInListById: findItemInListById,
            cancelFetchList: cancelFetchList,
            fetchList: fetchList
        };

        function init(_groupFilter) {
            paramsForState = _.cloneDeep($state.params);
            isTaskDraftList = $state.includes(PROJECT_STATE_NAMES.DRAFT_BOX);

            paramsForState.order = paramsForState.order || _.get($state, 'current.data.defaultOrder', null);
            groupFilter = _groupFilter || [];
        }

        function findItemInListById(targetId) {
            return targetId && _.find(items, {'id': targetId});
        }

        function removeItems(ids) {
            _.remove(items, function (item, index) {
                if (!_.includes(ids, item.id)) {
                    return false;
                }
                var targetItem = items[index + 1];
                if (targetItem && item._getOrSetProp('groupId') && !targetItem._getOrSetProp('groupId')) {
                    targetItem._copyProps(item, 'groupId,groupName');
                    targetItem._resetFetchedAt();
                }
                return true;
            });
        }

        function editListItem(id, callback) {
            var targetIndexes = [];
            var replaceTargets = _.filter(items, function (target, index) {
                if (target.id === id) {
                    targetIndexes.push(index);
                    return true;
                }
                return false;
            });
            if (_.isEmpty(replaceTargets)) {
                return;
            }

            _.forEach(replaceTargets, function (target, index) {
                items.splice(targetIndexes[index], 1, callback(target));
            });
        }

        function replaceItem(item) {
            NoticeTaskList.replaceItem(item);
            editListItem(item.id, function (target) {
                var clone = _.cloneDeep(item);
                clone._copyProps(target, 'groupId,groupName,checked');

                if ($state.current.data.isContentList) {
                    clone._copyProps(target, 'shortContents,events,files,createdAtSimpleFormat');
                    clone.snippet = target.snippet;
                    clone._getOrSetProp('uniqId', PostListWithContentBiz.makeUniqKey(clone));
                }
                return clone;
            });
        }

        function applyFunction(id, callback) {
            NoticeTaskList.applyFunction(id, callback);
            editListItem(id, function (target) {
                var clone = _.clone(target);
                _.result(clone, '_resetFetchedAt');
                callback(clone);
                return clone;
            });
        }

        function onErrorWhileRemoving(message, thenCallback) {
            MessageModalFactory.confirm(
                message + ['<p class="text-center">', gettextCatalog.getString('다시 삭제하시겠습니까?'), '</p>'].join(''),
                gettextCatalog.getString('업무 삭제'),
                {confirmBtnLabel: gettextCatalog.getString('삭제')}).result.then(function () {
                    thenCallback();
                }, function () {
                    fetchList();
                });
        }

        function addSimplePost(post) {
            items.unshift(post);
        }

        function stateGoWithoutReload(name, params, options) {
            options = _.assign(options || {}, {reload: false, notify: false});
            paramsForState = options.inherit !== false ? paramsForState : {order: paramsForState.order}; // order 정보를 유지
            StateParamsUtil.setListStatus('changing');
            $state.go(name, params, options);
            return options.withoutFetchList ? null : fetchList(params);
        }

        function cancelFetchList() {
            HelperPromiseUtil.cancelResource(_.get(prevFetchListResource, 'resource'));
        }

        function assignObjectWithoutUndefined(targetObj, assignObj) {
            return _.assignWith({}, targetObj, assignObj, function (targetValue, assignValue) {
                return _.isUndefined(assignValue) ? targetValue : assignValue;
            });
        }

        function getBoxFilter(_params) {
            var boxFilter = _.get($state, 'current.data.boxFilter', {}),
                boxFilterData = {};

            _.forEach(boxFilter, function (val, key) {
                boxFilterData[key] = _.isFunction(val) ? val(_params) : val;
            });

            return boxFilterData;
        }

        function makeParams(params) {
            var _params = assignObjectWithoutUndefined(paramsForState, params),
                removeParams = {
                    postNumber: null,
                    mailId: null,
                    commentId: null,
                    onlyPost: null,
                    projectCodeFilter: null,
                    filterStoreMode: null
                };
            paramsForState = _params;

            // page를 param에 setting하고 리스트 갱신할 때를 위한 코드
            pagination.movePageNum(_params.page || pagination.getCurrentPageNum());

            // TaskList의 필터값을 Api parameter로 변경
            return _.assign(TaskListFilterParamUtil.convertFilterToParam(_params),
                _.result(pagination, 'getParam', {page: 0, size: API_PAGE_SIZE.DEFAULT}),
                removeParams,
                getBoxFilter(_params));
        }

        function canGoPrevPage(currentPage, lastPage) {
            return currentPage > 0 && lastPage > 1;
        }

        function goPrevPageIfEmptyList(page) {
            var lastPage = pagination.getLastPage();
            if (_.isEmpty(items) && canGoPrevPage(page, lastPage)) {
                stateGoWithoutReload('.', {page: lastPage});
            }
        }

        // groupFilter에 값이 없으면 적용이 안되야 함
        function applyGroupFilter() {
            // filter 적용
            _.forEach(groupFilter, function (filter) {
                items = $filter(filter.name)(items, filter.params);
            });
        }

        function fetchList(params) {
            if ($state.includes(POPUP_STATE_NAMES.ROOT)) {
                return;
            }

            cancelFetchList();
            var _params = makeParams(params);

            prevFetchListResource = isTaskDraftList ?
                ListBizWrapperByType.getSelectedBizWrapper().listBiz.getDraftList(_params) :
                ListBizWrapperByType.getSelectedBizWrapper().listBiz.fetchList(_params);
            NoticeTaskList.fetchList(_params);
            loading = true;

            return prevFetchListResource.$promise.then(function (result) {
                items = result.contents() || [];
                totalCount = result.totalCount() || 0;

                goPrevPageIfEmptyList(_params.page);
                applyGroupFilter(_params.page);
                DigestService.safeGlobalDigest();
                StateParamsUtil.setListStatus(null);

                return items;
            }).finally(function () {
                if (!HelperPromiseUtil.isResourcePending(prevFetchListResource)) {
                    loading = false;
                }

            });
        }
    }

})();
