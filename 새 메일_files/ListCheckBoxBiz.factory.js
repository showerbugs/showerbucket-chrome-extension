(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('ListCheckBoxBiz', ListCheckBoxBiz);

    /* @ngInject */
    function ListCheckBoxBiz($state, PROJECT_STATE_NAMES, CommonItemList, _) {
        var currentItemPropertyPath = null;

        var itemPropertyPathForState = {
            post: {
                readAttrPath: 'users.me.member.read'
            },
            mail: {
                readAttrPath: 'mailSummary.flags.read'
            }
        };

        init();

        return {
            init: init,
            toggleItem: toggleItem,

            setAllItemsCheckedBy: setAllItemsCheckedBy,
            setCheckedItemsReadBy: setCheckedItemsReadBy,

            getItemsSize: getItemsSize,
            getCheckedItems: getCheckedItems,
            getCheckedItemIds: getCheckedItemIds,
            findItemInCheckedList:  findItemInCheckedList,
            makeLodashCheckedItems: makeLodashCheckedItems,

            hasImportantItem: hasImportantItem,
            hasUnreadItem: hasUnreadItem
        };


        // ------- define method --------

        function init() {
            _.forEach(CommonItemList.getItems(), function (item) {
                item._getOrSetProp('checked', false);
            });
            currentItemPropertyPath = $state.includes(PROJECT_STATE_NAMES.PROJECT_STATE) ? itemPropertyPathForState.post : itemPropertyPathForState.mail;
        }

        function toggleItem(item) {
            item._getOrSetProp('checked', !item._getOrSetProp('checked'));
        }

        function setAllItemsCheckedBy(items, check) {
            _.forEach(items, function (item) {
                item._getOrSetProp('checked', check);
            });
        }

        function setCheckedItemsReadBy(isRead) {
            makeLodashCheckedItems()
                .forEach(function (item) {
                    _.set(item, currentItemPropertyPath.readAttrPath, isRead);
                });
        }

        function getItemsSize() {
            return getCheckedItems().length;
        }

        function getCheckedItemIds() {
            return makeLodashCheckedItems()
                .map('id')
                .value();
        }

        function getCheckedItems() {
            return makeLodashCheckedItems().value();
        }

        function makeLodashCheckedItems() {
            return _(CommonItemList.getItems())
                .filter(function (item) {
                    return item._getOrSetProp('checked');
                });
        }

        function findItemInCheckedList(item) {
            return makeLodashCheckedItems()
                .find('id', item.id)
                .value();
        }

        function hasImportantItem() {
            return makeLodashCheckedItems()
                    .findIndex('annotations.favorited', true) !== -1;
        }

        function hasUnreadItem() {
            return makeLodashCheckedItems()
                    .some(function (item) {
                        return _.get(item, currentItemPropertyPath.readAttrPath) === false;
                    });
        }
    }

})();
