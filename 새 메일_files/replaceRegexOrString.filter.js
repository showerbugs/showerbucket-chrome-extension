(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .filter('replaceRegexOrString', ReplaceRegexOrString);

    /* @ngInject */
    function ReplaceRegexOrString() {
        //https://codeforgeek.com/2014/12/highlight-search-result-angular-filter/
        return function (text, phrase, replaceString) {
            if (phrase) {
                text = text && text.replace(phrase, replaceString || '');
            }
            return text;
        };
    }

})();
