(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailItemSecurityUtil', MailItemSecurityUtil);

    /* @ngInject */
    function MailItemSecurityUtil(gettextCatalog, _) {
        var DISPLAY_LEVEL_NAMES = {
            normal: {},
            in_house: {shortname: 'mail.list~~대외비~~', fullname: 'mail.view~~대외비~~'},
            secret: {shortname: 'mail.list~~기밀~~', fullname: 'mail.view~~기밀~~'}
        };

        return {
            isNormal: isNormal,
            isVisibleLevel: isVisibleLevel,
            getShortName: getShortName,
            getName: getName
        };

        function isNormal(level) {
            return level === 'normal';
        }

        function isVisibleLevel(level) {
            //level이 존재하지 않거나 'normal'이면 라벨 표시하지 않음
            return level && !isNormal(level);
        }

        function getName(level) {
            return gettextCatalog.getString(_.get(DISPLAY_LEVEL_NAMES[level], 'fullname'));   //Internal only, Confidential
        }

        function getShortName(level) {
            return gettextCatalog.getString(_.get(DISPLAY_LEVEL_NAMES[level], 'shortname'));    //Int. Conf.
        }
    }

})();
