(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .service('DigestService', DigestService);

    /* @ngInject */
    function DigestService($rootScope, $timeout) {
        var self = this;
        this.safeLocalDigest = function safeLocalDigest(scope) {
            // angular에서 $$phase 값은 rootScope만 변경함
            if (!$rootScope.$$phase) {
                scope.$digest();
            }
        };

        this.safeGlobalDigest = function safeGlobalDigest() {
            if (!$rootScope.$$phase) {
                $rootScope.$apply();
            }
        };

        this.forceGlobalDigest = function forceGlobalDigest() {
            return !$rootScope.$$phase ? $rootScope.$apply() : $rootScope.$applyAsync();
        };

        this.loadingComplete = function loadingComplete(scope, loadingPath) {
            _.set(scope, loadingPath, false);
            return $timeout(function () {
                _.set(scope, loadingPath, true);
                self.safeLocalDigest(scope);
            }, 0, false);
        };
    }

})();
