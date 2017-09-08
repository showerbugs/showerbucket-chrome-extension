(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .component('favoriteBtn', {
            templateUrl: 'modules/components/favoriteBtn/favoriteBtn.html',
            controller: FavoriteBtn,
            bindings: {
                item: '<',
                favorited: '<',
                type: '@',
                onClick: '&',
                selectedItem: '<?'
            }
        });

    /* @ngInject */
    function FavoriteBtn($state, API_ERROR_CODE, CommonItemList, ItemSyncService, ListBizWrapperByType, PostErrorHandleUtil, _) {
        var self = this;
        this.uiVersion = 0;

        this.$onChanges = function () {
            if (_.isEmpty(self.item)) {
                return;
            }
            this.uiVersion += 1;
        };

        this.toggleFavorite = function ($event) {
            self.onClick({$event: $event});
            return ListBizWrapperByType.getBizWrapper(self.type).markImportantBiz.toggleFavorite(self.item).then(function () {
                var isFavorited = !self.item.annotations.favorited,
                    stateName = $state.current.name;

                if (!isFavorited && _.includes(stateName, 'important')) {
                    CommonItemList.removeItems([self.item.id]);
                }
                ItemSyncService.syncItemUsingCallback(self.item.id, self.type, function (item) {
                    _.set(item, 'annotations.favorited', isFavorited);
                });
            }, function (errorResponse) {
                var errorActions = {};
                // TODO 제거
                if (!self.selectedItem) {
                    errorActions[API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED] = function (projectCode, postNumber) {
                        self.item.projectCode = projectCode;
                        self.item.number = postNumber;

                        self.toggleFavorite($event);
                    };
                } else {
                    errorActions = PostErrorHandleUtil.makeDefaultErrorActions(self.selectedItem, function () {
                        return self.toggleFavorite($event).then(function () {
                            ItemSyncService.syncItemUsingViewItem(self.selectedItem.data, self.type);
                        });
                    });
                }
                PostErrorHandleUtil.onPostError(errorResponse, errorActions);
            });
        };
    }

})();
