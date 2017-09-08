(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('PopupUtil', PopupUtil);

    /* @ngInject */
    function PopupUtil($q, $window, HelperUrlUtil, NgUtil, _) {
        // Public API here
        return {
            openTaskViewPopup: function (params) {
                return this.openPopup(HelperUrlUtil.makeProjectPopupUrl(params), '', {
                    width: 710,
                    height: 800
                });
            },

            openMailViewPopup: function (params) {
                return this.openPopup(HelperUrlUtil.makeMailPopupUrl(params), '', {
                    width: 710,
                    height: 800
                });
            },

            openMailWritePopup: function (type, params) {
                return this.openPopup(HelperUrlUtil.makeMailWritePopupUrl(type, params), '_blank', {
                    width: 1024,
                    height: 800
                });
            },

            openTaskWritePopup: function (type, params) {
                return this.openPopup(HelperUrlUtil.makeTaskWritePopupUrl(type, params), '_blank', {
                    width: 1024,
                    height: 800
                });
            },

            openTaskTemplateWritePopup: function (params) {
                return this.openPopup(HelperUrlUtil.makeTaskTemplateWritePopupUrl(params), '_blank', {
                    width: 1024,
                    height: 800
                });
            },

            openCalendarWritePopup: function (type, params) {
                return this.openPopup(HelperUrlUtil.makeCalendarWritePopupUrl(type, params), '_blank', {
                    width: 1024,
                    height: 800
                });
            },

            openTranslatorPopup: function (type, params) {
                return this.openPopup(HelperUrlUtil.makeTranslatorPopupUrl(type, params), '_blank', {
                    width: 800,
                    height: 600
                });
            },

            openPopup: function (href, winname, options) { // show new PupupView
                options = options || {};
                options.width = options.width || 600;
                options.height = options.height || 800;

                //window.open의 height은 window.innerHeight임. WINDOW OS chrome에서 브라우저 크기가 자동 resize되지 않는 버그가 있어 popup toolbar의 최대값인 66을 빼줌
                //toolbar의 높이 = window.outerHeight - window.innerHeight
                options.width = Math.min($window.screen.availWidth, options.width);
                options.height = Math.min($window.screen.availHeight - 66, options.height);
                options.outerHeight = Math.min($window.parseInt($window.screen.availHeight, 10));
                var x = ($window.screen.availWidth / 2) - (options.width / 2);
                var y = ($window.screen.availHeight / 2) - ((options.height + 66) / 2);

                var defaultOptions = angular.extend({}, {
                    'resizable': 'yes',
                    'toolbar': 'no',
                    'location': 'no',
                    'directories': 'no',
                    'status': 'no',
                    'menubar': 'no',
                    'scrollbars': 'no',
                    'reload': ' false',
                    'copyhistory': 'no',
                    'top': y,
                    'left': x
                }, options);

                var popupOptions = _.map(defaultOptions, function (value, prop) {
                    return prop + '=' + value;
                }).join(',');

                var newWindowRef = $window.open(href, winname, popupOptions);
                //newWindowRef.moveTo(x, y);
                newWindowRef.focus();
                return newWindowRef;
            },

            getOpenerInjectorPromise: function () {
                try {
                    var openerWindow = $window.opener.window;
                    // 자신이 팝업창일경우 부모창에 접근시 Exception 발생할 수 있으며 자신이 본창인 경우에는 opener.window exception 발생합니다.
                    return $q.when(NgUtil.get$Injector(openerWindow));
                } catch (e) {
                    // 본창이 다른 페이지로 변했을 경우를 예외처리합니다.
                    return $q.reject();
                }
            },

            resetBizCacheInOpenerWindow: function (targetBizName) {
                // 자신이 본 창인 경우 예외처리
                if (!$window.opener) {
                    return;
                }

                this.getOpenerInjectorPromise().then(function (opener$Injector) {
                    opener$Injector.invoke([targetBizName, function (biz) {
                        biz.resetCache();
                    }]);
                });
            }
        };
    }

})();
