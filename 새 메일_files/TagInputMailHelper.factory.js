(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('TagInputMailHelper', TagInputMailHelper);

    /* @ngInject */
    function TagInputMailHelper(Member, addressparser, PATTERN_REGEX, _) {
        return {
            queryMemberOrDl: queryMemberOrDl,
            allowEmailUser: allowEmailUser,
            makeEmailForm: makeEmailForm,
            toEmailFormFromMailDetailUser: toEmailFormFromMailDetailUser,
            toMailDetailUserFromEmailForm: toMailDetailUserFromEmailForm
        };



        function queryMemberOrDl(query) {
            //TODO dl생기면 tyle에 dl추가
            return Member.searchWithParam(query, 'all', ['member', 'distributionList']).then(function (result) {
                return result.contents();
            });
        }

        function makeEmailForm(name, emailAddress) {
            return {
                type: 'emailUser',
                emailUser: {
                    name: name,
                    emailAddress: emailAddress
                }
            };
        }

        function allowEmailUser(input) {
            var addresses = addressparser.parse(input);
            if(addresses.length && PATTERN_REGEX.email.test(addresses[0].address)) {
                return makeEmailForm(addresses[0].name, addresses[0].address);
            }
        }

        function toEmailFormFromMailDetailUser(memberList) {
            var result = [],
                members = _.isArray(memberList) ? memberList : (_.isObject(memberList) ? [memberList] : []);
            _.forEach(members, function (member) { //TODO : email - > emailAddress
                var name = _.get(member[member.type], 'name'),
                    emailAddress = _.get(member[member.type], 'emailAddress', member[member.type].email);
                result.push(makeEmailForm(name, emailAddress));
            });
            return result;
        }

        function toMailDetailUserFromEmailForm(emailList) {
            return _.map(emailList, function (email) {
                return {
                    type: 'emailUser',
                    emailUser: {
                        emailAddress: email
                    }
                };
            });
        }

    }

})();
