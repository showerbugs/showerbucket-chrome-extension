(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .directive('mailResizeDivider', MailResizeDividerDirective);

    /* @ngInject */
    function MailResizeDividerDirective($document) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                leftMinWidth: '@',
                leftMaxWidth: '@',
                rightMinWidth: '@',
                rightMaxWidth: '@',
                onEndResizing: '&'
            },
            link: postLink
        };

        function postLink(scope, element, attrs, ngModelCtrl) {
            var DIVIDER_SIZE = 4,
                body$ = angular.element('body'),
                resizing = false, leftWidth,
                left$, right$, parentWidth;

            _init();

            ngModelCtrl.$render = function () {
                leftWidth = _calculate(ngModelCtrl.$modelValue);
                _setWidth(leftWidth);
            };

            function _init() {
                element.on('mousedown', _onMouseDown);

                scope.$on('$destroy', function () {
                    element.off('mousedown', _onMouseDown);
                    $document.off('mousemove', _onMouseMove);
                    $document.off('mouseup', _onMouseUp);
                });
            }

            function _setWidth(size) {
                if (!resizing) {
                    _assignElement();
                }
                left$.css('width', size + 'px');
                right$.css('width', 'calc(100% - ' + (size + DIVIDER_SIZE) + 'px');
            }

            function _onMouseDown() {
                resizing = true;
                element.off('mousedown', _onMouseDown);
                body$.addClass('none-selectable');
                _assignElement();

                $document.on('mousemove', _onMouseMove);
                $document.on('mouseup', _onMouseUp);
            }

            function _onMouseMove(ev) {
                var offset = ev.pageX - right$.offset().left,
                    newSize = leftWidth + offset;
                leftWidth = _calculate(newSize);
                ngModelCtrl.$setViewValue(leftWidth);
                _setWidth(leftWidth);
            }

            function _onMouseUp() {
                $document.off('mousemove', _onMouseMove);
                $document.off('mouseup', _onMouseUp);
                element.on('mousedown', _onMouseDown);
                body$.removeClass('none-selectable');
                scope.onEndResizing();
                resizing = false;
            }

            function _assignElement() {
                left$ = element.prev();
                right$ = element.next();
                parentWidth = element.parent().width();
                leftWidth = left$.width();
            }

            function _calculate(size) {
                if (scope.leftMinWidth) {
                    size = Math.max(size, scope.leftMinWidth);
                }
                if (scope.leftMaxWidth) {
                    size = Math.min(size, scope.leftMaxWidth);
                }
                if (scope.rightMinWidth) {
                    size = parentWidth - Math.max(parentWidth - size, scope.rightMinWidth);
                }
                if (scope.rightMaxWidth) {
                    size = parentWidth - Math.min(parentWidth - size, scope.rightMaxWidth);
                }
                return size;
            }
        }
    }
})();
