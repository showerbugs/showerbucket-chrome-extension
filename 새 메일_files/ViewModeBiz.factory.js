(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .constant('VIEW_MODE', {
            VERTICAL_SPLIT_VIEW: 'verticalSplitView',
            FULL_VIEW: 'fullView'
        })
        .factory('ViewModeBiz', ViewModeBiz);

    /* @ngInject */
    function ViewModeBiz(VIEW_MODE, RootScopeEventBindHelper, localStorage) {
        var VIEW_MODE_KEY = 'view-mode',
            CHANGE_VIEW_MODE_EVENT = 'changeViewMode',
            prevViewMode,
            viewModeCache;
        return {
            CHANGE_VIEW_MODE_EVENT: CHANGE_VIEW_MODE_EVENT,
            VIEW_MODE: VIEW_MODE,
            get: function () {
                // default는 verticalSplitView
                viewModeCache = viewModeCache || localStorage.getItem(VIEW_MODE_KEY) || VIEW_MODE.VERTICAL_SPLIT_VIEW;
                return viewModeCache;
            },
            set: function (viewMode) {
                prevViewMode = viewModeCache;
                viewModeCache = viewMode;
                localStorage.setItem(VIEW_MODE_KEY, viewMode);
                _emitViewModeEvent(false);
            },
            // 멘션박스등의 예외처리를 위해 추가
            setCache: function (viewMode) {
                prevViewMode = viewModeCache;
                viewModeCache = viewMode;
                _emitViewModeEvent(true);
            },
            reloadCache: function () {
                viewModeCache = localStorage.getItem(VIEW_MODE_KEY) || VIEW_MODE.VERTICAL_SPLIT_VIEW;
            }
        };

        function _emitViewModeEvent(cacheOnly) {
            RootScopeEventBindHelper.emit(CHANGE_VIEW_MODE_EVENT, viewModeCache, prevViewMode, cacheOnly);
        }
    }

})();
