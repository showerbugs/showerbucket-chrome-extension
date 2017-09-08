(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .filter('fontAvailable', FontAvailable);

    /* @ngInject */
    function FontAvailable() {
        return function (fontName) {
            // TODO IE에서 탭이 많아지면 메모리릭이 발생(1기가 정도의 메모리를 점유하게 되고, spellcheck 버그와 연관되어 있을 것으로 추정)
            return angular.element.fontAvailable(fontName);
        };
    }

})();
