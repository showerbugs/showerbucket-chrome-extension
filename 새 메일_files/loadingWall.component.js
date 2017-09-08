(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .component('loadingWall', {
            templateUrl: 'modules/common/components/loadingWall/loadingWall.html',
            controller: LoadingWall
        });

    /* @ngInject */
    function LoadingWall() {
    }

})();
