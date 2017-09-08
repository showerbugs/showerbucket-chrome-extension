(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('disableNgAnimate', DisableNgAnimate);
    //The ui-bootstrap's carousel is loaded, I can only click once on next/prev, then nothing else happen. Something strange, the next/prev slide is shown, but the first is still on the page
    //https://github.com/angular-ui/bootstrap/issues/1350

    /* @ngInject */
    function DisableNgAnimate($animate) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                $animate.enabled(element, false);
            }
        };
    }

})();
