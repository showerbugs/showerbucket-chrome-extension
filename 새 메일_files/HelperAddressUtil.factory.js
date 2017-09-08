(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('HelperAddressUtil', HelperAddressUtil)
        .filter('displayAddressInMail', displayAddressInMail)
        .filter('displayAddressListInMail', displayAddressListInMail);

    /* @ngInject */
    function HelperAddressUtil() {
        function makeNamePart(displayName) {
            return displayName ? displayName : '';
        }

        function makeEmailPart(email) {
            return email ? '<' + email + '>' : '';
        }

        function makeDisplayInMail(displayName, email) {
            var fullDisplay = [makeNamePart(displayName), makeEmailPart(email)].join(' ').trim();
            return displayName ? fullDisplay : email;
        }

        function makeDisplayMemberNameOrEmail(displayName, email) {
            return displayName ? displayName : email;
        }

        function makeDisplayInTask(name, email, role) {
            return role === 'emailUser' ? makeDisplayInMail(name, email) : makeDisplayMemberNameOrEmail(name, email);
        }

        return {
            makeDisplayInMail: makeDisplayInMail,
            makeDisplayInTask: makeDisplayInTask // draft일 경우와 emailuser가 있을 경우도 고려해서 처리
        };
    }

    /* @ngInject */
    function displayAddressInMail(HelperAddressUtil) {
        return function (memberOrGroup) {
            return HelperAddressUtil.makeDisplayInMail(memberOrGroup.name, memberOrGroup.emailAddress);
        };
    }

    /* @ngInject */
    function displayAddressListInMail(HelperAddressUtil, _) {
        return function (memberOrGroupList) {
            var results = [];
            _.forEach(memberOrGroupList, function (memberOrGroup) {
                var memberDetail = memberOrGroup[memberOrGroup.type];
                results.push(HelperAddressUtil.makeDisplayInMail(memberDetail.name, memberDetail.emailAddress));
            });
            return results;
        };
    }

})();
