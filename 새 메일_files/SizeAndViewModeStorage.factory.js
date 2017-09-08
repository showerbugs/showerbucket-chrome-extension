(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('SizeAndViewModeStorage', SizeAndViewModeStorage);

    /* @ngInject */
    function SizeAndViewModeStorage($state, PROJECT_STATE_NAMES, localStorage, _) {
        return {
            loadMode: loadMode,
            loadSize: loadSize,
            saveMode: saveMode,
            saveSize: saveSize,
            makeStorageKey: makeStorageKey
        };

        function loadMode(key) {
            var storage = _getLocalStorageObject(key);
            return _.get(storage, 'mode', 'divide');
        }

        function loadSize(key) {
            var storage = _getLocalStorageObject(key);
            return _.get(storage, 'left', 0);
        }

        function saveMode(key, mode) {
            var object = {left: loadSize(key), mode: mode};
            localStorage.setItem(key, angular.toJson(object));
        }

        function saveSize(key, size) {
            var object = {left: size, mode: loadMode(key)};
            localStorage.setItem(key, angular.toJson(object));
        }

        function makeStorageKey(type) {
            return _getKeyPrefix() + type;
        }

        function _getLocalStorageObject(key) {
            var storage = localStorage.getItem(key);
            return angular.fromJson(storage);
        }

        function _getKeyPrefix() {
            var stateName = $state.current.name;

            if (stateName.indexOf(PROJECT_STATE_NAMES.PROJECT_STATE) > -1) {
                return 'taskDivideRatio';
            } else if (stateName.indexOf('main.page.calendar') > -1) {
                return 'calendarDivideRatio';
            }
        }
    }

})();
