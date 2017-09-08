(function () {

    'use strict';

    angular
        .module('doorayWebApp.render')
        .filter('sanitize', Sanitize);

    /* @ngInject */
    function Sanitize($sanitize) {
        return function (input) {
            // 본문에 NULL이 들어올 때의 예외처리
            input = input || '';
            try {
                return $sanitize(input);
            } catch(e) {
                input = input.replace('<iframe', '&lt;iframe');
                return $sanitize(input);
            }

        };
    }

})();
