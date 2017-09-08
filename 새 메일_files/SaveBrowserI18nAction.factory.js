(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('SaveBrowserI18nAction', SaveBrowserI18nAction);

    /* @ngInject */
    function SaveBrowserI18nAction($cookies, HelperConfigUtil) {
        return {
            removeLocaleCookie: removeLocaleCookie
        };

        function removeLocaleCookie() {
            $cookies.remove(_makeOldSaveFlagCookieKey(), {domain: 'dooray.com'});
            $cookies.remove(_makSaveFlagCookieKey(), {domain: 'dooray.com'});
        }

        function _makeOldSaveFlagCookieKey() {
            return 'doorayIsSettingLocale-' + HelperConfigUtil.env();
        }

        function _makSaveFlagCookieKey() {
            return ['doorayIsSettingLocale', HelperConfigUtil.env(), HelperConfigUtil.orgMemberId()].join('-');
        }
    }

})();
