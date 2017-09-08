(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailItemPropertyUtil', MailItemPropertyUtil);

    /* @ngInject */
    function MailItemPropertyUtil() {
        return {
            getOrSetFavoriteFlag: getOrSetFavoriteFlag,
            getOrSetReadFlag: getOrSetReadFlag
        };

        function getOrSetFavoriteFlag(mail, isFavorited) {
            if (_.isBoolean(isFavorited)) {
                _.set(mail, 'annotations.favorited', isFavorited);
            }
            return _.get(mail, 'annotations.favorited', false);
        }

        function getOrSetReadFlag(mail, isRead) {
            if (_.isBoolean(isRead)) {
                _.set(mail, 'mailSummary.flags.read', isRead);
            }
            return _.get(mail, 'mailSummary.flags.read', false);
        }
    }

})();
