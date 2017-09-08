(function () {

    'use strict';

    angular
        .module('doorayWebApp.stream')
        .service('StreamItemList', StreamItemList);

    /* @ngInject */
    function StreamItemList(API_PAGE_SIZE, HelperConfigUtil, HelperPromiseUtil, ServiceUseUtil, StreamListBiz, _) {
        var items = [],
            remainItems = [],
            option = {},
            remainCardCount = 999,
            fetchPromise,
            isFirst = true;

        return {
            init: init,
            clear: clear,
            getItems: getItems,
            getRemainCount: getRemainCount,
            hasRemainItems: hasRemainItems,
            setReadList: setReadList,
            fetchNextList: fetchNextList,
            applyFunction: applyFunction,
            replaceItem: replaceItem,
            removeItem: removeItem
        };

        function init(_option) {
            items = [];
            remainItems = [];
            option = _option;
            remainCardCount = 999;
            isFirst = true;
            return _fetchList().then(function (result) {
                setReadList();
                return result;
            });
        }

        function clear() {
            items.length = 0;
            remainItems.length = 0;
            isFirst = true;
            fetchPromise = null;
        }

        function getItems() {
            return items;
        }

        function getRemainCount() {
            return remainCardCount;
        }

        function hasRemainItems() {
            return remainItems.length > 0;
        }

        function setReadList() {
            StreamListBiz.setRead();
        }

        function appendItems(size) {
            Array.prototype.push.apply(items, remainItems.splice(0, size));
        }

        function fetchNextList(size) {
            return _getFetchPromise(size).then(function () {
                return appendItems(Math.min(remainItems.length, size));
            });
        }

        // option = {needStreamItem: true}
        function applyFunction(id, type, callback, option) {
            var isFirst = true;
            option = option || {};
            _editListItem(id, type, function (target) {
                var clone = _.clone(target),
                    cloneData;
                if (isFirst && !option.needStreamItem) {
                    cloneData = clone._wrap.refMap[type + 'Map'](id);
                    callback(cloneData);
                    isFirst = false;
                }

                if (option.needStreamItem) {
                    callback(clone);
                }

                clone._resetFetchedAt();
                return clone;
            });
        }

        function replaceItem(item, type) {
            // 1번만 적용하면 같은 것을 참조하여 모두 반영됩니다.
            var isFirst = true;
            _editListItem(item.id, type, function (target) {
                var clone = _.clone(target);
                if (isFirst) {
                    clone._wrap.editReferences(type + 'Map', function (typeMap) {
                        var clonedItem = _.cloneDeep(item);
                        clonedItem.body = _.get(typeMap[item.id], 'body');
                        typeMap[item.id] = clonedItem;
                    });
                    isFirst = false;
                }
                clone._resetFetchedAt();
                return clone;
            });
        }

        function removeItem(type, id) {
            _.remove(items, function (item) {
                return type === item.type && item[type].id === id;
            });

            _.remove(remainItems, function (item) {
                return type === item.type && item[type].id === id;
            });
        }

        function _editListItem(id, type, callback) {
            var itemLength = items.length,
                targetIndexes = [];
            var replaceTargets = _.filter(items.concat(remainItems), function (item, index) {
                if (type === item.type && item[type].id === id) {
                    targetIndexes.push(index);
                    return true;
                }
                return false;
            });
            if (_.isEmpty(replaceTargets)) {
                return;
            }

            _.forEach(replaceTargets, function (target, index) {
                if (targetIndexes[index] < itemLength) {
                    items.splice(targetIndexes[index], 1, callback(target));
                    return;
                }
                remainItems.splice(_.findIndex(remainItems, target), 1, callback(target));
            });
        }

        function _fetchList() {
            var param = {
                size: API_PAGE_SIZE.STREAM,
                services: HelperConfigUtil.enableNewFeature() ? 'project,mail,calendar' :
                    ServiceUseUtil.getUseServiceNames().join(',')
            };

            if (option.mention) {
                param.mentionScope = option.mention === 'all' ? 'all' : 'me';
            }

            if (option.unread) {
                param.read = false;
            }

            fetchPromise = StreamListBiz.fetchList(param, isFirst).$promise.then(function (result) {
                isFirst = false;
                remainItems = remainItems.concat(result.contents());
                remainCardCount = result.totalCount();
                return result;
            });

            return fetchPromise;
        }

        function _getFetchPromise(size) {
            if (remainItems.length <= size &&
                !HelperPromiseUtil.isResourcePending(fetchPromise) &&
                remainCardCount > API_PAGE_SIZE.STREAM) {
                return _fetchList();
            }
            return fetchPromise;
        }
    }

})();
