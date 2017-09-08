(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .component('optimizedChromeWarning', {
            templateUrl: 'modules/share/header/optimizedChromeWarning/optimizedChromeWarning.html',
            controller: OptimizedChromeWarning
        });

    /* @ngInject */
    function OptimizedChromeWarning($cookies, deviceDetector, moment) {
        var $ctrl = this;

        this.checkedBrowserWarning = false;

        this.deviceDetector = deviceDetector;
        this.checkNoDisplayBrowserWarning = checkNoDisplayBrowserWarning;
        this.closeBrowserWarning = closeBrowserWarning;

        this.$onInit = function () {
            $ctrl.checkedBrowserWarning = angular.fromJson($cookies.get('checkedBrowserWarning')) || false;
        };

        function checkNoDisplayBrowserWarning() {
            $cookies.put('checkedBrowserWarning', "true", {
                domain: 'dooray.com',
                expires: moment().add(3, 'months').toDate() //until after 3 months.
            });
            closeBrowserWarning();
        }

        function closeBrowserWarning() {
            $ctrl.checkedBrowserWarning = true;
        }
    }

})();
