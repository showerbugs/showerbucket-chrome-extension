(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('doorayPolarisLink', DoorayPolarisLink);

    /* @ngInject */
    function DoorayPolarisLink($timeout, $window, BROWSERS, OS_VERSIONS, DownloadPolarisModal, HelperConfigUtil, HelperDomainUtil, MyInfo, PolarisFileBiz, deviceDetector, _) {
        return {
            templateUrl: 'modules/components/doorayPolarisLink/doorayPolarisLink.html',
            restrict: 'EA',
            scope: {
                mimeType: '=?',
                fileId: '='
            },
            link: function (scope) {
                var CONFIRM_OPEN_POLARIS_DELAY = 5000;

                var POLARIS_TEAM = [
                    'bart@infrawareglobal.com',
                    'jihunx@infrawareglobal.com',
                    'uxhjlee@infrawareglobal.com',
                    'bori@infrawareglobal.com',
                    'hjkim@infrawareglobal.com',
                    'sminlee@infrawareglobal.com',
                    'stkim@infrawareglobal.com',
                    'heyluv@infrawareglobal.com',
                    'indong@infrawareglobal.com',
                    'firemblem@infrawareglobal.com',
                    'kimjh@infrawareglobal.com',
                    'wooyong@infrawareglobal.com',
                    'kuiw@infrawareglobal.com',
                    'leekye227@infrawareglobal.com',
                    'mia@infrawaretech.com',
                    'sangae@infrawaretech.com'
                ];
                MyInfo.getMyInfo().then(function (myInfo) {
                    scope.showUpdateBtn = HelperConfigUtil.enableNewFeature() || _.includes(POLARIS_TEAM, myInfo.emailAddress);
                });

                scope.openAsPolaris = function () {
                    PolarisFileBiz.makePath({
                        fileId: scope.fileId
                    })
                        .then(function (result) {
                            var data = result.result();

                            if (deviceDetector.browser === BROWSERS.IE && (deviceDetector.os_version !== OS_VERSIONS.WINDOWS_10 && deviceDetector.os_version !== OS_VERSIONS.WINDOWS_8)) {
                                _.forEach(data, function (value, key) {
                                    if (key !== 'url') {
                                        data[key] = $window.encodeURIComponent(value);
                                    }
                                });
                            }

                            var path = ['polaris-office://Download?url=', HelperDomainUtil.getEnvUrl(), data.url,
                                '&sk=', data.encryptedSessionKey, '&options=', data.encryptedOptions, '&srt=', data.encryptedSessionRequestToken,
                                '&filename=', data.filename, '&type=dooray&t=', moment().valueOf()].join('');

                            // a link로 클릭을 할 경우 custom link는 IE에서 508글자까지만 허용되는 문제가 있어서 iframe으로 처리
                            // http://stackoverflow.com/questions/9017734/what-is-the-maximum-length-of-a-custom-url-protocol-using-synchronous-pluggable
                            angular.element('<iframe />', {
                                'id': 'hiddenIFrame',
                                'name': 'hiddenIFrame',
                                'src': path,
                                'style': 'display: none;'
                            }).appendTo("body");
                            confirmOpenPolaris(data);

                            $timeout(function () {
                                angular.element('#hiddenIFrame').remove();
                            }, 0, false);
                        });
                };

                function confirmOpenPolaris(data) {
                    $timeout(function () {
                        PolarisFileBiz.confirmFileStatus(data.url)
                            .then(function (result) {
                                if (!_.get(result.result(), 'downloaded')) {
                                    DownloadPolarisModal.open();
                                }
                            });
                    }, CONFIRM_OPEN_POLARIS_DELAY, false);
                }
            }
        };
    }

})();
