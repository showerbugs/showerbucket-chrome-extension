(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .constant('CONTENT_LAYOUT_MODE', {
            VERTICAL_SPLIT_VIEW: 'verticalSplitView',
            FULL_LIST_VIEW: 'fullListView'
        })
        .factory('MainContentsViewModeRepository', MainContentsViewModeRepository);

    /* @ngInject */
    function MainContentsViewModeRepository(CONTENT_LAYOUT_MODE, localStorage) {
        var STORAGE_VIEW_MODE_KEY = 'main-contents-view-mode',
            currentViewMode;

        return {
            get: get,
            set: set,
            selectAndSave: selectAndSave,
            loadFromStorage: loadFromStorage,
            saveToStorage: saveToStorage,
            isVerticalSplitView: isVerticalSplitView,
            isFullListView: isFullListView

        };

        function get() {
            return currentViewMode || CONTENT_LAYOUT_MODE.VERTICAL_SPLIT_VIEW;
        }

        function set(viewMode) {
            currentViewMode = viewMode;
        }

        function selectAndSave(viewMode) {
            set(viewMode);
            saveToStorage(viewMode);
        }

        function loadFromStorage() {
            return localStorage.getItem(STORAGE_VIEW_MODE_KEY);
        }

        function saveToStorage(viewMode) {
            localStorage.setItem(STORAGE_VIEW_MODE_KEY, viewMode);
        }

        function isVerticalSplitView() {
            return get() === CONTENT_LAYOUT_MODE.VERTICAL_SPLIT_VIEW;
        }

        function isFullListView() {
            return get() === CONTENT_LAYOUT_MODE.FULL_LIST_VIEW;
        }
    }

})();
