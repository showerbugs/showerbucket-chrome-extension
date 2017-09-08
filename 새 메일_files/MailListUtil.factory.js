(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .constant('MAIL_LIST_ITEM_DISPLAY_TARGET', {
            fromUser: 'users.from.emailUser',
            toFirstUser: 'users.to[0].emailUser',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        })
        .factory('MailListUtil', MailListUtil);

    /* @ngInject */
    function MailListUtil(API_PAGE_SIZE, MAIL_LIST_ITEM_DISPLAY_TARGET, MailListStateMetaUtil, gettextCatalog, simpleFormatDateFilter, _) {

        return {
            makeDisplayFromUser: makeDisplayFromUser,
            makeDisplayToFirstUser: makeDisplayToFirstUser,
            makeDisplayUserByTarget: makeDisplayUserByTarget,
            makeDateTimeByTarget: makeDateTimeByTarget,
            makeDisplayReceiptUser: makeDisplayReceiptUser,
            makeApiParams: makeApiParams
        };

        function makeDisplayFromUser(mail) {
            var emailUser = _.get(mail, MAIL_LIST_ITEM_DISPLAY_TARGET.fromUser, {name: gettextCatalog.getString('보낸 사람 없음')});
            return emailUser.name || emailUser.emailAddress;
        }

        function makeDisplayToFirstUser(mail) {
            var emailUser = _.get(mail, MAIL_LIST_ITEM_DISPLAY_TARGET.toFirstUser, {name: ''});
            return emailUser.name || emailUser.emailAddress;
        }

        function makeDisplayUserByTarget(mail, displayTarget) {
            return MAIL_LIST_ITEM_DISPLAY_TARGET.fromUser === displayTarget ? makeDisplayFromUser(mail) :
                (MAIL_LIST_ITEM_DISPLAY_TARGET.toFirstUser === displayTarget ? makeDisplayToFirstUser(mail) : '');
        }

        function makeDateTimeByTarget(mail, displayTarget) {
            var dateTime = simpleFormatDateFilter(mail[displayTarget]);
            return [dateTime.day || '', dateTime.time || ''].join('');
        }

        function makeDisplayReceiptUser(receipt) {
            return receipt.rcptName || receipt.rcptAddress;
        }

        function makeApiParams(listStateName, stateParams) {
            return _.assign({},
                _getFilterParam(stateParams),
                MailListStateMetaUtil.getBoxApiFilter(listStateName)
            );
        }

        function _getFilterParam(stateParams) {
            return {
                page: (angular.fromJson(stateParams.page) - 1) || 0,
                size: API_PAGE_SIZE.MAIL,
                read: stateParams.read,
                folderId: stateParams.folderId,
                order: stateParams.order || '-createdAt'
            };
        }
    }

})();
