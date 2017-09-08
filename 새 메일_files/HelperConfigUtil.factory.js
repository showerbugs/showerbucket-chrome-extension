(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .factory('HelperConfigUtil', HelperConfigUtil);

    /* @ngInject */
    function HelperConfigUtil(CONFIG, gettextCatalog) {
        function createHelperFunction(key) {
            return function (value) {
                if (!angular.isUndefined(value)) {
                    CONFIG.set(key, value);
                }
                return CONFIG.get(key);
            };
        }

        return {
            env: createHelperFunction('env'),
            wsUrl: createHelperFunction('wsUrl'),
            orgMemberId: createHelperFunction('orgMemberId'),
            userCode: createHelperFunction('userCode'),
            enableNewFeature: createHelperFunction('enableNewFeature'),
            version: createHelperFunction('version'),
            nextUrl: createHelperFunction('nextUrl'),
            tenantDomain: createHelperFunction('tenantDomain'),
            serviceUse: createHelperFunction('serviceUse'),
            checkMailDomain: createHelperFunction('checkMailDomain'),
            locale: createHelperFunction('locale'),
            timezone: createHelperFunction('timezone'),
            myProjectItem: function () {
                return {
                    code: '@' + createHelperFunction('userCode')(),
                    _name: gettextCatalog.getString('(없음)')
                };
            }
        };
    }

})();
