(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .filter('urlToHtml', UrlToHtml);

    /* @ngInject */
    function UrlToHtml(Autolinker) {

        return function (input) {
            //console.log('urlToHtml', 'typeof', typeof input, input && input.length);
            // url형태의 텍스트를 찾아 a태그로 변경
            return input ? Autolinker.link(input, {
                stripPrefix: false,
                twitter: false,
                phone: false,
                stripTrailingSlash: false,
                urls: {schemeMatches: true, wwwMatches: true, tldMatches: false}
            }) : input;
        };
    }

})();
