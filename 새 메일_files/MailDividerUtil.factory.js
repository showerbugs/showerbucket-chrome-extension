(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailDividerUtil', MailDividerUtil);

    /* @ngInject */
    function MailDividerUtil($window, MAIL_SCREEN_MODE, MailResizeDividerRepository) {
        return {
            makeVerticalDivider: makeVerticalDivider,
            makeModalDivider: makeModalDivider,
            setScreenMode: setScreenMode,
            toggleScreenMode: toggleScreenMode,
            calcModalSize: calcModalSize
        };

        function makeVerticalDivider(type, initialWidth) {
            var key = _makeStorageKey(type),
                storageObj = MailResizeDividerRepository.loadLocalStorage(key);

            return {
                key: key,
                type: type,
                screenMode: MAIL_SCREEN_MODE.NORMAL,
                viewWidth: storageObj.size || initialWidth,
                setScreenMode: function (mode) {
                    this.screenMode = mode;
                },
                saveLocalStorage: function () {
                    MailResizeDividerRepository.saveLocalStorage(key, {size: this.viewWidth});
                }
            };
        }

        function makeModalDivider(type) {
            var key = _makeStorageKey(type),
                storageObj = MailResizeDividerRepository.loadLocalStorage(key);

            return {
                key: key,
                type: type,
                screenMode: storageObj.mode || MAIL_SCREEN_MODE.NORMAL,
                viewWidth: calcModalSize(storageObj.mode, storageObj.size),
                setScreenMode: function (mode) {
                    this.screenMode = mode;
                    var size = MailResizeDividerRepository.loadLocalStorage(key).size;
                    this.viewWidth = calcModalSize(mode, size);
                    MailResizeDividerRepository.saveLocalStorage(key, {size: size, mode: this.screenMode});
                },
                saveLocalStorage: function () {
                    MailResizeDividerRepository.saveLocalStorage(key, {size: this.viewWidth, mode: this.screenMode});
                }
            };
        }

        function setScreenMode(divider, mode) {
            if (mode === _.get(divider, 'screenMode', MAIL_SCREEN_MODE.NORMAL)) {
                return;
            }
            divider.setScreenMode(mode);
        }

        function toggleScreenMode(divider) {
            setScreenMode(divider, divider.screenMode === MAIL_SCREEN_MODE.FULL ? MAIL_SCREEN_MODE.NORMAL : MAIL_SCREEN_MODE.FULL);
        }

        function calcModalSize(mode, size) {
            if (mode === MAIL_SCREEN_MODE.FULL) {
                return 100000;
            }

            if (size) {
                return size;
            }

            return _calcInitialSize();
        }

        function _makeStorageKey(type) {
            return 'mailDivideRatio' + type;
        }

        function _calcInitialSize() {
            var subjectItem$ = angular.element('mail-full-list-subject-item');
            if (!_.isEmpty(subjectItem$)) {
                var windowSize = angular.element($window).width;
                return windowSize - (subjectItem$.offset().left + (subjectItem$.width() / 2));
            }
        }
    }

})();
