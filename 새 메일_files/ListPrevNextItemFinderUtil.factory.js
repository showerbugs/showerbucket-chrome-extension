(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .factory('ListPrevNextItemFinderUtil', ListPrevNextItemFinderUtil);

    /* @ngInject */
    function ListPrevNextItemFinderUtil(_) {
        return {
            prevItemInList: prevItemInList,
            nextItemInList: nextItemInList
        };

        function prevItemInList(list, value) {
            var prevIndex = _verifyIndexRangeInList(list, _.indexOf(list, value) - 1);
            return prevIndex >= 0 ? list[prevIndex] : null;
        }

        function nextItemInList(list, value) {
            var nextIndex = _verifyIndexRangeInList(list, _.indexOf(list, value) + 1);
            return nextIndex >= 0 ? list[nextIndex] : null;
        }

        function _verifyIndexRangeInList(list, index) {
            if (index >= 0 && index < list.length) {
                return index;
            }
            return -1;
        }
    }

})();
