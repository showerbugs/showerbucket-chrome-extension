(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('eventTriggerMe', EventTriggerMe);

    /* @ngInject */
    function EventTriggerMe($parse, $timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var triggerWhen = $parse(attrs.eventTriggerWhen);
                var triggerDelay = $parse(attrs.eventTriggerDelay)(scope);
                scope.$watch(triggerWhen, function (value, oldValue) {
                    if (value === true &&
                        (!attrs.eventTriggerIgnoreFirst || (attrs.eventTriggerIgnoreFirst && !oldValue) )) {
                        $timeout(function () {
                            var target = attrs.eventTriggerTarget ? element.find(attrs.eventTriggerTarget) : element;
                            target.trigger(attrs.eventTriggerMe);
                        }, triggerDelay || 0);
                    }
                });
            }
        };
    }

})();
