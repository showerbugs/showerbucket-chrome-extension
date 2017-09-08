(function () {

    'use strict';

    angular
        .module('doorayWebApp.render')
        .filter('textToEmoji', textToEmoji);

    /* @ngInject */
    function textToEmoji(SyntaxToElement, SYNTAX_REGEX) {

        return function (input) {
            return input && input.replace(SYNTAX_REGEX.icon, function (match, prefix, text) { //:+1:
                    return SyntaxToElement.icon(text, prefix);
                });
        };
    }

})();
