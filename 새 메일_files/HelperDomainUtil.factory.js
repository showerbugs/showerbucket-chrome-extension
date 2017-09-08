(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .factory('HelperDomainUtil', HelperDomainUtil);

    /* @ngInject */
    function HelperDomainUtil($location, HelperConfigUtil) {
        return {
            'createEnvUrl': function (domain) {
                //env()가 alpha일 경우 prefix 무시함
                var env = (HelperConfigUtil.env() === 'alpha' || HelperConfigUtil.env() === 'real') ? '' : HelperConfigUtil.env();
                if (env) {
                    // domain 이 nhnent.dooray.com에 evn가 dev 일 때 domain이 nhnent.dev.dooray.com으로 변경됩니다
                    domain = domain.replace(/(\.)/, '.' + env + '.');
                }
                return this.getEnvUrl(domain);
            },

            'getEnvUrl': function (domain) {
                var port = $location.port();
                return $location.protocol() + '://' + (domain || $location.host()) + ((port !== 80 && port !== 443 && ':' + port) || '');
            },

            'getLastPath': function () {
                var urlPath = $location.path().split('/');
                return urlPath[urlPath.length - 1];
            }
        };
    }

})();
