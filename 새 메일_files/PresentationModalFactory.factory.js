(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('PresentationSettingModalFactory', PresentationSettingModalFactory)
        .controller('PresentationSettingCtrl', PresentationSettingCtrl);

    /* @ngInject */
    function PresentationSettingModalFactory($uibModal, $q) {
        function openModal(param) {
            return $q.when($uibModal.open({
                templateUrl: 'modules/project/view/PresentationModalFactory/presentationSetting.html',
                controller: 'PresentationSettingCtrl',
                windowClass: 'setting-modal dooray-setting-content presentation-modal',
                resolve: {
                    param: function () {
                        return param;
                    }
                }
            }));
        }

        return {
            open: function (post) {
                return openModal({projectCode: post.data.projectCode, postNumber: post.data.number});
            },
            openByToken: function (token) {
                return openModal({token: token});
            }
        };
    }

    /* @ngInject */
    function PresentationSettingCtrl($scope, $window, $uibModalInstance, $interval, $timeout, param, PresentationTheme, HelperConfigUtil, localStorage, Mousetrap, _) {
        var intervalHandler,
            PRESENTER_KEY = 'presenter';

        $scope.show = function (themeKey) {
            $uibModalInstance.dismiss();
            //모달 창이 닫힌 다음에 새창이 뜨도록 일정 간격 줌.
            $timeout(function () {
                $window.open(makePresentationUrl() + '&theme=' + themeKey);
            }, 300, false);
        };

        $scope.close = function () {
            $uibModalInstance.dismiss();
        };

        $scope.showSample = function (theme) {
            var index = 1;
            intervalHandler = $interval(function () {
                if (index > theme.samples.length - 1) {
                    index = 0;
                }
                theme.sample = theme.samples[index++];
            }, 1000);
        };

        $scope.stopShowSample = function () {
            initSample();
            if (intervalHandler) {
                $interval.cancel(intervalHandler);
                intervalHandler = null;
            }
        };

        $scope.$on('$destroy', function () {
            $scope.stopShowSample();
            Mousetrap.unbind('enter');
        });

        $scope.$watch('select.presenter', function(newVal) {
            localStorage.setItem(PRESENTER_KEY, newVal);
        });

        function makePresentationUrl() {
            var prefixPresentationUrl;
            prefixPresentationUrl = (param.token) ? ('/share/posts/' + param.token) : ('/popup/project/projects/' + param.projectCode + '/' + param.postNumber);
            return prefixPresentationUrl + '?viewMode=presentation';
        }

        function init() {
            $scope.themes = PresentationTheme;
            $scope.select = {};
            $scope.select.themeKey = Object.keys(PresentationTheme)[0];
            $scope.enableNewFeature = HelperConfigUtil.enableNewFeature();
            $scope.select.presenter = localStorage.getItem(PRESENTER_KEY) || '';
            initSample();
            Mousetrap.bind('enter', function(){
                $scope.show($scope.select.themeKey);
            });
        }

        function initSample() {
            _.forEach($scope.themes, function (theme) {
                theme.sample = theme.samples[0];
            });
        }

        init();
    }

})();
