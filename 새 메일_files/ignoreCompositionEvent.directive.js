(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .directive('ignoreCompositionEvent', IgnoreCompositionEvent);

    /* @ngInject */
    function IgnoreCompositionEvent($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                if (attrs.ignoreCompositionEvent) {
                    $timeout(function () {
                        offCompositionEvent(element.find(attrs.ignoreCompositionEvent));
                    }, 0, false);
                    return;
                }
                offCompositionEvent(element);
            }
        };

        // In composition mode, users are still inputing intermediate text buffer,
        // hold the listener until composition is done. but korean input must recognize when composition doing
        function offCompositionEvent(element) {
            element.off('compositionstart').off('compositionend');
        }
    }

})();
