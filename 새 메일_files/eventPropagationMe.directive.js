(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('eventPropagationMe', EventPropagationMe);

    /* @ngInject */
    function EventPropagationMe($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var target$ = null;

                $timeout(function () {
                    target$ = element.find(attrs.eventPropagationTarget);
                    if (_.isEmpty(target$)) {
                        target$ = angular.element(attrs.eventPropagationTarget);
                    }
                }, 0, false);


                element.on(attrs.eventPropagationMe, function (event) {
                    var eventTarget$ = angular.element(event.target);

                    if (target$ && (eventTarget$.is(element) ||
                        eventTarget$.is(attrs.eventPropagationInclude))) {
                        event.stopPropagation();
                        event.preventDefault();
                        target$.trigger(attrs.eventPropagationMe);
                    }
                });

                scope.$on('$destroy', function () {
                    element.off(attrs.eventPropagationMe);
                });
            }
        };
    }

})();
