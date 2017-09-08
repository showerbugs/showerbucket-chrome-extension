(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('HtmlUtil', HtmlUtil);

    /* @ngInject */
    function HtmlUtil() {
        return {

            isEmpty: function (html) {
                html = html ? html.trim() : '';
                return !this.ignoreBlankHtml(html);
            },

            ignoreBlankHtml: function (html) {
                return html.replace(/^<br>/, '').replace(/^&nbsp;/, '');
            }
        };
    }

})();
