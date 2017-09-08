(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .filter('escapeHighlight', Escape);

    /* @ngInject */
    function Escape(highlightFilter, _) {
        return function (text, query) {
            return highlightFilter(_.escape(text), _.escape(query));
        };
    }

})();
