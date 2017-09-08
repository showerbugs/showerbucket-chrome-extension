(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .component('newVersionWarning', {
            templateUrl: 'modules/share/header/newVersionWarning/newVersionWarning.html',
            controller: NewVersionWarning
        });

    /* @ngInject */
    function NewVersionWarning($window, VersionService) {
        this.refreshForNewVersion = refreshForNewVersion;
        this.hasNewVersion = VersionService.hasNewVersion;

        function refreshForNewVersion() {
            $window.location.reload();
        }
    }

})();
