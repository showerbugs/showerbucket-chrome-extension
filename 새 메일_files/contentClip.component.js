(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .component('contentClip', {
            templateUrl: 'modules/components/contentClip/contentClip.html',
            controller: ContentClip,
            bindings: {
                content: '<',
                successMsg: '@',
                failMsg: '@',
                buttonText: '@'
            },
            transclude: true
        });

    /* @ngInject */
    function ContentClip($element, Clipboard, growl, gettextCatalog) {

        var $ctrl = this;

        var clipboard = new Clipboard($element.find('button')[0]);
        var successCallback = function () {
            var copyUrlSuccessMsg = $ctrl.successMsg || gettextCatalog.getString('클립보드에 복사했습니다.');
            growl.success(copyUrlSuccessMsg);
        };
        clipboard.on('success', successCallback);

        var errorCallback = function () {
            var copyUrlErrorMsg = $ctrl.failMsg || gettextCatalog.getString('⌘-c 를 눌러 주세요.');
            growl.warning('<input focus-me="true" value="' + $ctrl.content + '" style="width:100%; color:#333;"/><p>' + copyUrlErrorMsg + '</p>');
        };
        clipboard.on('error', errorCallback);

        $ctrl.$onDestroy = function () {
            $element.off();
            clipboard.off('success', successCallback);
            clipboard.off('error', errorCallback);
            clipboard.destroy();
        };
    }

})();
