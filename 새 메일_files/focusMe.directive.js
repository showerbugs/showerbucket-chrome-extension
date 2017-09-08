(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .directive('focusMe', FocusMe);

    /* @ngInject */
    function FocusMe($parse, $timeout, _) {
        return {
            //scope: true,   // optionally create a child scope
            link: function (scope, element, attrs) {
                var model = $parse(attrs.focusMe);
                // ui-bootstrap v0.13.4 부터 [autofocus] 속성이 없으면 모달에 focus를 주게 변경되어 150ms의 delay를 주어 회피했습니다.
                var delay = $parse(attrs.focusMeDelay)(scope) || 150;
                scope.$watch(model, function (value) {
                    if (value === true) {
                        $timeout(function () {
                            var target$ = element.find(attrs.focusMeTarget);
                            target$ = _.isEmpty(target$) ? element : target$;
                            target$.focus();
                            if ($parse(attrs.focusWithSelect)(scope)) {
                                target$.select();
                            }

                            if ($parse(attrs.focusMeUseBoolean)(scope)) {
                                // reset value to false if we're using a boolean
                                $parse(attrs.focusMe).assign(scope, false);
                            }
                        }, delay, false);
                    }
                });
            }
        };
    }

})();
