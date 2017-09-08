(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .component('pageHeader', {
            templateUrl: 'modules/share/header/pageHeader/pageHeader.html',
            controller: PageHeader
        });

    /* @ngInject */
    function PageHeader($scope, $state) {
        var $ctrl = this;
        $scope.$on('$stateChangeSuccess', function () {
            $ctrl.hideSearch = !$state.includes('**.project.**');
        });
        $ctrl.hideSearch = !$state.includes('**.project.**');
    }

})();
