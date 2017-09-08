(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('MovePostsModalStorage', MovePostsModalStorage);

    /* @ngInject */
    function MovePostsModalStorage(localStorage) {
        var KEY = 'MOVING_POSTS_TARGET_INFO',
            cached = null;

        return {
            save: save,
            get: get
        };

        function get() {
            var storage = localStorage.getItem(KEY);
            cached = angular.fromJson(storage);
            return cached;
        }

        function save(projectCode, showExtendOption, tagMapList, milestoneMapList) {
            var tagMap = _convertListToMap(tagMapList),
                milestoneMap = _convertListToMap(milestoneMapList);
            if (!cached || cached.projectCode !== projectCode) {
                return _saveItem(_makeItem(projectCode, showExtendOption, tagMap, milestoneMap));
            }

            _.assign(cached.tagMap, tagMap);
            _.assign(cached.milestoneMap, milestoneMap);
            return _saveItem(_makeItem(projectCode, showExtendOption, cached.tagMap, cached.milestoneMap));
        }

        function _convertListToMap(list) {
            if (_.isEmpty(list)) {
                return {};
            }
            var map = {};
            _.forEach(list, function (info) {
                return map[info.from] = info.to;
            });
            return map;
        }

        function _saveItem(item) {
            cached = item;
            localStorage.setItem(KEY, angular.toJson(cached));
        }

        function _makeItem(projectCode, showExtendOption, tagMap, milestoneMap) {
            return {
                projectCode: projectCode,
                showExtendOption: showExtendOption,
                tagMap: tagMap || {},
                milestoneMap: milestoneMap || {}
            };
        }
    }

})();
