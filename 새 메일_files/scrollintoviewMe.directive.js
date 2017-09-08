(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('scrollintoviewMe', ScrollintoviewMeDirective);

    /* @ngInject */
    function ScrollintoviewMeDirective($parse, $timeout, _) {
        return {
            restrict: 'A',
            link: postLink
        };

        function postLink(scope, element, attrs) {
            var model = $parse(attrs.scrollintoviewMe);
            // ui-bootstrap v0.13.4 부터 [autofocus] 속성이 없으면 모달에 focus를 주게 변경되어 150ms의 delay를 주어 회피했습니다.
            var delay = $parse(attrs.scrollintoviewMeDelay)(scope) || 150;
            scope.$watch(model, function (value) {
                if (value === true) {
                    $timeout(function () {
                        var target$ = element.find(attrs.scrollintoviewMeTarget);
                        target$ = _.isEmpty(target$) ? element : target$;
                        target$[0].scrollIntoView();
                    }, delay, false);
                }
            });
        }
    }



})();
