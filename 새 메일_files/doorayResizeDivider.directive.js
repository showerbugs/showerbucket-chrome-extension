(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('doorayResizeDivider', DoorayResizeDivider);

    /* @ngInject */
    function DoorayResizeDivider($document, $injector, $parse, ResizeDividingElementFactory, RootScopeEventBindHelper, _) {
        var DEBOUNCE_TIME = 200;
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var type = attrs.doorayResizeDivider,
                    option =  $parse(attrs.option)(scope) || {},
                    divider;

                var _broadcastResize = attrs.emit ? _.debounce(function (size) {
                    RootScopeEventBindHelper.emit(attrs.emit, size);
                }, DEBOUNCE_TIME) : angular.noop;

                _init();

                function _init() {
                    $injector.invoke([attrs.resizeConstructor || 'ResizingDividerConstructor', function (constructor) {
                        divider = new constructor(type, element, option);
                    }]);

                    ResizeDividingElementFactory.addDivider(type, divider);
                    element.on('mousedown', _onMouseDown);

                    scope.$on('$destroy', function () {
                        ResizeDividingElementFactory.removeDivider(type);
                        element.off('mousedown', _onMouseDown);
                    });

                    if (attrs.onReady) {
                        $parse(attrs.onReady)(scope);
                    }
                }

                function _onMouseDown() {
                    element.off('mousedown', _onMouseDown);
                    divider.startResizing();

                    $document.on('mousemove', _onMouseMove);
                    $document.on('mouseup', _onMouseUp);
                }

                function _onMouseMove(ev) {
                    _broadcastResize(divider.calculate(ev));
                }

                function _onMouseUp() {
                    $document.off('mousemove', _onMouseMove);
                    $document.off('mouseup', _onMouseUp);
                    divider.endResizing();
                    element.on('mousedown', _onMouseDown);
                }
            }
        };
    }

})();
