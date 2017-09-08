(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .component('naviLogo', {
            templateUrl: 'modules/share/navi/naviLogo/naviLogo.html',
            controller: NaviLogo
        });

    /* @ngInject */
    function NaviLogo(DomainRepository) {
        var $ctrl = this;
        _init();

        function _init() {
            DomainRepository.defaultDomainPromise().then(function (domain) {
                $ctrl.domain = domain;
            });
        }
    }

})();
