(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .filter('escapeHtml', EscapeHtml);

    /* @ngInject */
    function EscapeHtml() {
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
        };

        return function (input) {
            return String(input).replace(/[&<>"'\/]/g, function (s) {
                return entityMap[s];
            });
        };
    }

})();
