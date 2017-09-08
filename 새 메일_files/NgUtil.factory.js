(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .factory('NgUtil', NgUtil);

    /* @ngInject */
    function NgUtil($injector, $rootScope, $window, _) {
        // Public API here
        return {
            get$Injector: function (_window, _ngAppElement) {
                //인자로 주어지지 않거나 자식창에서 부모창으로 접근할 경우도 발생하여 인자값과 injection된 값을 비교하여 현재 $injector 리턴함
                if (_.isUndefined(_window) || $window === _window) {
                    return $injector;
                }
                return _.get(_window, 'angular.element') ? _window.angular.element(_ngAppElement || _window.document).injector() : null;
            },
            safeApply: function (applyCallback, scope) {
                //avoid to $digest exception
                //https://github.com/angular/angular.js/issues/2023
                applyCallback = applyCallback || angular.noop;
                var targetScope = scope || $rootScope;
                var phase = $rootScope.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    targetScope.$evalAsync(applyCallback);
                    //if (angular.isFunction(applyCallback)) {
                    //    //applyCallback();
                    //}
                } else {
                    targetScope.$apply(applyCallback);
                }
            }
        };
    }

})();

//angular
//.module('doorayWebApp.common')
//.run(['$rootScope', function ($rootScope) {
//    //https://github.com/angular/angular.js/issues/2023
//    $rootScope.safeApply = function (fn) {
//        var phase = this.$root.$$phase;
//        if (phase === '$apply' || phase === '$digest') {
//            if (angular.isFunction(fn)){ fn(); }
//        } else {
//            this.$apply(fn);
//        }
//    };
//}])
//.run([ '$rootScope', '$exceptionHandler', function ($rootScope, $exceptionHandler) {
//    //Main performance bottleneck in AngularJs is the digest cycle and its dirty checking
//    //$apply method always starts the digest cycle on the root scope,
//    //$localApply method to the $rootScope that starts the digest cycle on the current scope, instead of the root
//    //reference http://bahmutov.calepin.co/local-angular-scopes.html
//    //https://github.com/angular/angular.js/blob/d3b1f502e3099d91042a1827a006ad112ea67d36/src/ng/rootScope.js#L1018
//    $rootScope.$localApply = function $localApply(expr) {
//        try {
//            this.$$phase = '$apply';
//            return this.$eval(expr);
//        } catch (e) {
//            $exceptionHandler(e);
//        } finally {
//            this.$$phase = null;
//            try {
//                // instead of starting dirty checking at the root
//                // $rootScope.$digest();
//                // start at the scope where called
//                this.$digest();
//            } catch (e) {
//                $exceptionHandler(e);
//                throw e;
//            }
//        }
//    };
//}])
//.config([ '$compileProvider', function ($compileProvider) {
//    //https://github.com/angular/angular.js/blob/master/src/ng/directive/ngEventDirs.js#L49
//
//    // For events that might fire synchronously during DOM manipulation
//    // we need to execute their event handlers asynchronously using $evalAsync,
//    // so that they are not executed in an inconsistent state.
//    var forceAsyncEvents = {
//        'blur': true,
//        'focus': true
//    };
//    angular.forEach(
//        'click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste'.split(' '),
//        function(eventName) {
//            var directiveName = 'local' + eventName.charAt(0).toUpperCase() + eventName.slice(1).toLowerCase(); //directiveNormalize('ng-' + eventName);
//            $compileProvider.directive(directiveName, ['$parse', '$rootScope', function($parse, $rootScope) {
//                return {
//                    restrict: 'A',
//                    compile: function($element, attr) {
//                        // We expose the powerful $event object on the scope that provides access to the Window,
//                        // etc. that isn't protected by the fast paths in $parse.  We explicitly request better
//                        // checks at the cost of speed since event handler expressions are not executed as
//                        // frequently as regular change detection.
//                        var fn = $parse(attr[directiveName], /* interceptorFn */ null, /* expensiveChecks */ true);
//                        return function ngEventHandler(scope, element) {
//                            element.on(eventName, function(event) {
//                                var callback = function() {
//                                    fn(scope, {$event:event});
//                                };
//                                if (forceAsyncEvents[eventName] && $rootScope.$$phase) {
//                                    scope.$evalAsync(callback);
//                                } else {
//                                    // use $localApply instead of $apply
//                                    scope.$localApply(callback);
//                                }
//                            });
//                        };
//                    }
//                };
//            }]);
//        }
//    );
//}]);
