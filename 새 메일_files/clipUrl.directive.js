(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .directive('clipUrl', ClipUrl);

    /* @ngInject */
    function ClipUrl(growl, Clipboard, gettextCatalog) {
        return {
            templateUrl: 'modules/share/directives/clipUrl/clipUrl.html',
            restrict: 'E',
            replace: true,
            scope: {
                text: '=',
                label: '@?',
                successMsg: '@?'
            },
            link: function (scope, element) {
                var clipboard = new Clipboard(element[0]);

                var successCallback = function () {
                    var copyUrlSuccessMsg = scope.successMsg || gettextCatalog.getString('주소를 복사했습니다.');
                    growl.success(copyUrlSuccessMsg + '<br/>' + scope.decodeText);
                };
                clipboard.on('success', successCallback);

                var errorCallback = function () {
                    var copyUrlErrorMsg = gettextCatalog.getString('⌘-c 를 눌러 주세요.');
                    growl.warning('<input focus-me="true" value="' + scope.decodeText + '" style="width:100%; color:#333;"/><p>' + copyUrlErrorMsg + '</p>');
                };
                clipboard.on('error', errorCallback);

                var watchHandler = scope.$watch('text', function(newVal) {
                    scope.decodeText = decodeURIComponent(newVal);
                });

                scope.$on('$destroy', function () {
                    element.off();
                    watchHandler();
                    clipboard.off('success', successCallback);
                    clipboard.off('error', errorCallback);
                    clipboard.destroy();
                });
            }
        };
    }
})();
