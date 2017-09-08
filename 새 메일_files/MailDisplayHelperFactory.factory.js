(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailDisplayHelperFactory', MailDisplayHelperFactory);

    /* @ngInject */
    function MailDisplayHelperFactory(moment, STREAM_SHORT_CONTENT_LENGTH, BodyContentsConvertUtil, EmailAddressClassifyBiz, displayUserFilter, simpleFormatDateFilter, gettextCatalog, _) {
        var AssignDisplayPropertiesBuilder = angular.element.inherit({
            __constructor: function (mail) {
                this.data = mail;
            },
            withClassifyMembers: function () {
                var users = _.get(this.data, 'users'),
                    lodashAllMember = _([]).concat(users.to, users.cc, users.from),
                    allMemberEmail = lodashAllMember.map(function (member) {
                        return member[member.type].emailAddress;
                    }).value();

                EmailAddressClassifyBiz.query(allMemberEmail).then(function (result) {
                    var resultMap = result.result(),
                        member;
                    lodashAllMember.forEach(function (memberWrapper) {
                        member = memberWrapper[memberWrapper.type];
                        _.assign(memberWrapper, resultMap[member.emailAddress]);
                    });
                });

                return this;
            },
            withDisplayMembers: function () {
                var users = _.get(this.data, 'users'),
                    allUsers = _([]).concat(users.to, users.cc, users.from);
                _.forEach(allUsers.value(), function (user) {
                    displayUserFilter(user, {}, {isEmail: true});
                });
                return this;
            },
            withFromMember: function () {
                this.data._getOrSetProp('fromMember', _.get(this.data, 'users.from.emailUser', {}));
                return this;
            },
            withFirstToMember: function () {
                this.data._getOrSetProp('firstToMember', _.get(this.data, 'users.to[0].emailUser', {name: gettextCatalog.getString('(없음)')}));
                return this;
            },
            withCreatedAtSimpleFormat: function () {
                this.data._getOrSetProp('createdAtSimpleFormat', simpleFormatDateFilter(this.data.createdAt));
                return this;
            },
            withUpdatedAtSimpleFormat: function () {
                this.data._getOrSetProp('updatedAtSimpleFormat', simpleFormatDateFilter(this.data.updatedAt));
                return this;
            },
            // option = {length: 350}
            withShortContent: function (option) {
                var body = this.data.body;

                if (!body) {
                    return this;
                }

                var content = BodyContentsConvertUtil.convertToShortHtmlInMail(body, _.get(option, 'length', STREAM_SHORT_CONTENT_LENGTH));
                this.data._getOrSetProp('shortContents', content);
                return this;
            },
            withNew: function (lastReadAt) {
                this.data._props.isNew = moment(lastReadAt).isBefore(this.data.createdAt);
                return this;
            },
            build: function () {
                return this.data;
            }
        });

        return {
            AssignDisplayPropertiesBuilder: AssignDisplayPropertiesBuilder,
            assignDisplayPropertiesInList: function (task) {
                return new AssignDisplayPropertiesBuilder(task)
                    .withFromMember()
                    .withFirstToMember()
                    .withCreatedAtSimpleFormat()
                    .withUpdatedAtSimpleFormat()
                    .build();
            },
            assignDisplayPropertiesInView: function (task) {
                return new AssignDisplayPropertiesBuilder(task)
                    .withClassifyMembers()
                    .withDisplayMembers()
                    .build();
            },
            assignDisplayPropertiesInStream: function (mail) {
                return new AssignDisplayPropertiesBuilder(mail)
                    .withFromMember()
                    .withDisplayMembers()
                    .withShortContent()
                    .build();
            }
        };
    }

})();
