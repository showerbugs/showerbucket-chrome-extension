(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .directive('mailContentsViewModalResizer', MailContentsViewModalResizerDirective);

    /* @ngInject */
    function MailContentsViewModalResizerDirective($document, $window) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                leftMargin: '<',
                minSize: '@',
                onStartResizing: '&',
                onEndResizing: '&'
            },
            link: postLink
        };

        function postLink(scope, element, attrs, ngModelCtrl) {
            var SHADOW_WIDTH = 10,
                body$ = angular.element('body'),
                resizing = false,
                windowSize = angular.element($window).width(),
                modal$, dialog$, currentSize;

            _init();

            ngModelCtrl.$render = function () {
                currentSize = _calculateSize(ngModelCtrl.$modelValue);
                _setSize(currentSize);
            };

            function _init() {
                element.on('mousedown', _onMouseDown);

                scope.$on('$destroy', function () {
                    element.off('mousedown', _onMouseDown);
                    $document.off('mousemove', _onMouseMove);
                    $document.off('mouseup', _onMouseUp);
                });
            }

            function _setSize(size) {
                if (!resizing) {
                    _assignElement();
                }

                dialog$.width(size);
                modal$.width(size + SHADOW_WIDTH);
            }

            function _onMouseDown() {
                resizing = true;
                element.off('mousedown', _onMouseDown);
                scope.onStartResizing();
                body$.addClass('none-selectable');
                _assignElement();

                $document.on('mousemove', _onMouseMove);
                $document.on('mouseup', _onMouseUp);
            }

            function _onMouseMove(event) {
                currentSize = _calculateSize(windowSize - event.pageX);
                ngModelCtrl.$setViewValue(currentSize);
                _setSize(currentSize);
            }

            function _calculateSize(size) {
                size = size || 0;
                size = Math.max(size, angular.fromJson(scope.minSize));
                size = Math.min(size, windowSize - scope.leftMargin);
                return size;
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
                modal$ = element.parents('.modal');
                dialog$ = element.parents('.modal-dialog');
                currentSize = dialog$.width();
                windowSize = angular.element($window).width();
            }
        }
    }

})();
