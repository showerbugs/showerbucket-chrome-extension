(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('ApiPageSizeFactory', ApiPageSizeFactory);

    /* @ngInject */
    function ApiPageSizeFactory($state, API_PAGE_SIZE, ORG_STATE_NAME, StateParamsUtil, VIEW_MODE, ViewModeBiz, localStorage, _) {
        var PAGE_SIZE_APPEND_KEY = 'pagesize';
        return {
            getListApiSize: function () {
                if ($state.includes(ORG_STATE_NAME)) {
                    return getOrgApiSize();
                }
                return ViewModeBiz.get() !== VIEW_MODE.VERTICAL_SPLIT_VIEW ? API_PAGE_SIZE.LIST_VIEW : API_PAGE_SIZE.POST;
            },
            changeOrApiSize: changeOrApiSize
        };

        function getOrgStorageKey() {
            return StateParamsUtil.getFilterUniqueKey('.' + [$state.params.boxGroup, $state.params.boxName, PAGE_SIZE_APPEND_KEY].join('.'));
        }

        function getOrgApiSize() {
            var key = getOrgStorageKey(),
                apiSizeMap = angular.fromJson(localStorage.getItem(key));
            return _.get(apiSizeMap, 'size', API_PAGE_SIZE.IN_ORG_SETTING);
        }

        function changeOrApiSize(size) {
            var key = getOrgStorageKey();
            localStorage.setItem(key, angular.toJson({size: size}));
        }
    }

})();
