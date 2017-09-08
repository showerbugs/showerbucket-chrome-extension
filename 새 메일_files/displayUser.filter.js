(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .filter('displayUser', DisplayUser);

    /* @ngInject */
    function DisplayUser(WORKFLOWS, HelperAddressUtil, _) {
        // option: {isEmail: true}
        function makeDisplayUser(user, refMap, option) {
            var type = user.type;
            if (type === 'group') {
                user.group.members = setGroupMemberList(user.group, refMap, option);
                if(refMap.projectMemberGroupMap) {
                    user.group = _.assign(user.group, refMap.projectMemberGroupMap(user[user.type].projectMemberGroupId));
                }
            } else if (type === 'member') {
                user.member = setMember(user.member, refMap);
            }

            setDisplayProperty(user, refMap.workflowMap, option);
            return user;
        }

        function setMember(member, refMap) {
            if(refMap.organizationMemberMap) {
                member = _.assign(member, refMap.organizationMemberMap(member.organizationMemberId));
            } else if(refMap.userMap) {
                member = _.assign(member, refMap.userMap(member.id));
            }
            return member;
        }

        function setGroupMemberList(group, refMap, option) {
            var memberList = group.memberList? group.memberList: _.map(group.organizationMemberIdList, function(id) {
                return {organizationMemberId: id};
            });
            return _.map(memberList, function (member) {
                var groupMember = {
                    member: setMember(member, refMap),
                    type: 'member'
                };

                setDisplayProperty(groupMember, refMap.workflowMap, option);
                return groupMember;
            });
        }

        function setDisplayProperty(user, workflowMap, option) {
            user._displayName = makeDisplayName(user, _.get(option, 'isEmail', false));
            user._workflowClass = makeWorkflowClass(user, workflowMap);
        }

        function makeDisplayName(user, isEmail) {
            var memberOrGroup = user[user.type],
                targetFunc = isEmail ? HelperAddressUtil.makeDisplayInMail : HelperAddressUtil.makeDisplayInTask;
            return targetFunc(memberOrGroup.fullCode || memberOrGroup.name, memberOrGroup.emailAddress, user.type);
        }

        function makeWorkflowClass(user, workflowMap) {
            var workflowId = _.get(user[user.type], 'workflowId');
            if(workflowId && workflowMap && workflowMap(workflowId)) {
                return workflowMap(workflowId).class;
            }
            return makeReadToWorkflowClass(user);
        }

        function makeReadToWorkflowClass(user) {
            if (user.type === 'member') {
                return user.member.read ? WORKFLOWS[WORKFLOWS.length - 1] : WORKFLOWS[0];
            }

            return makeReadToWorkflowClassInGroup(user);
        }

        function makeReadToWorkflowClassInGroup(user) {
            if (user[user.type].read) {
                return WORKFLOWS[WORKFLOWS.length - 1];
            }

            return _.every(user[user.type].members, function(member){
                return !member.member.read;
            }) ? WORKFLOWS[0] : WORKFLOWS[1];
        }

        return makeDisplayUser;
    }

})();
