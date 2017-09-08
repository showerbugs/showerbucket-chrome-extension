(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TagInputTaskHelper', TagInputTaskHelper);

    /* @ngInject */
    function TagInputTaskHelper($q, Member, ProjectMemberGroupBiz, displayUserFilter, _) {

        function queryOrgMembersByIds(ids) {
            return _.isEmpty(ids) ? $q.when([]) : Member.fetchListWithoutCache({ids: ids}).then(function (result) {
                return _.map(result.contents(), function(member){
                    return displayUserFilter({type: 'member', member: member}, member._wrap.refMap);
                });
            });
        }

        function queryOrgMemberGroupsByIds(ids) {
            return _.isEmpty(ids) ? $q.when([]) : ProjectMemberGroupBiz.fetchListWithoutCache({projectCode: '*', ids: ids}).then(function (result) {
                return _.map(result.contents(), function(group){
                    return displayUserFilter({type: 'group', group: group}, group._wrap.refMap);
                });
            });
        }

        var Converter = {
            toMemberOrGroupFromTaskDetailUser: function (memberOrGroups) {
                if (_.isUndefined(memberOrGroups) || _.isNull(memberOrGroups)) {
                    return [];
                }
                memberOrGroups = _.isArray(memberOrGroups) ? memberOrGroups : [memberOrGroups];

                return _(memberOrGroups).compact().map(function (memberOrGroup) {
                    var type = memberOrGroup.type;
                    var transformData = {type: type};
                    if (type === 'group') { //group type
                        transformData[type] = {projectMemberGroupId: memberOrGroup[type].projectMemberGroupId};
                    } else if (type === 'member') {    //member type
                        transformData[type] = {organizationMemberId: memberOrGroup[type].organizationMemberId};
                    } else if (type === 'emailUser' ||  type === 'distributionList') {
                        transformData[type] = {
                            emailAddress: memberOrGroup[type].emailAddress,
                            name: memberOrGroup[type].name
                        };
                    }
                    return transformData;
                }).value();
            },
            //tagInput에 들어가는 포맷으로 변경 {id만} : 멤버
            toMemberFromMemberIds: function (orgMemberIds) {
                orgMemberIds = _.isArray(orgMemberIds) ? orgMemberIds : (_.isString(orgMemberIds) ? [orgMemberIds] : []);
                return _.map(orgMemberIds, function (memberId) {
                    return {type: 'member', member: {organizationMemberId: memberId}};
                });
            },
            //tagInput에 들어가는 포맷으로 변경 {id만} : 그룹
            toMemberGroupFromMemberIds: function (orgMemberGroupIds) {
                orgMemberGroupIds = _.isArray(orgMemberGroupIds) ? orgMemberGroupIds : (_.isString(orgMemberGroupIds) ? [orgMemberGroupIds] : []);
                return _.map(orgMemberGroupIds, function (memberGroupId) {
                    return {type: 'group', group: {projectMemberGroupId: memberGroupId}};
                });
            },

            toMemberOrGroupFromSearchResult: function (memberOrGroups) {
                return _.map(memberOrGroups, function (user) {
                    if(user.type === 'member') {
                        user.member.organizationMemberId = user.member.id;
                    } else if(user.type === 'group'){
                        user.group.projectMemberGroupId = user.group.id;
                    }
                    return user;
                });
            },
            toDetailMemberOrGroupFromDetailInfo: function (memberOrGroups, organizationMemberMap) {
                return _.map(memberOrGroups, function (user) {
                    return displayUserFilter(user, organizationMemberMap);
                });
            },
            getIdsGroupByTypeFromUsers : function (newVal) {
                var groupsByType = _.groupBy(newVal, 'type');
                return {
                    member: _.map(groupsByType.member, function (member) {
                        return member.member.organizationMemberId;
                    }),
                    group: _.map(groupsByType.group, function (group) {
                        return group.group.projectMemberGroupId;
                    }),
                    emailUser: groupsByType.emailUser
                };
            }
        };


        return {
            toMemberOrGroupFromTaskDetailUser: Converter.toMemberOrGroupFromTaskDetailUser,
            toMemberFromMemberIds: Converter.toMemberFromMemberIds,
            toMemberGroupFromMemberIds: Converter.toMemberGroupFromMemberIds,
            toMemberOrGroupFromSearchResult: Converter.toMemberOrGroupFromSearchResult,
            toDetailMemberOrGroupFromDetailInfo: Converter.toDetailMemberOrGroupFromDetailInfo,

            toDetailMemberOrGroupFromIds: function (idList) {
                var ids = Converter.getIdsGroupByTypeFromUsers(idList);
                return $q.all([queryOrgMembersByIds(ids.member), queryOrgMemberGroupsByIds(ids.group)]).then(function (results) {
                    return Converter.toMemberOrGroupFromSearchResult(_.compact(_.concat(results[0], ids.emailUser, results[1])));
                });
            },

            getUniqMembersFromMemberOrGroups: function (memberOrGroups) {
                return _(_(memberOrGroups).filter({type: 'member'}).map('member').value()).concat(
                    _(memberOrGroups).filter({type: 'group'}).map('group.members').without(undefined).flatten().map('member').value()).uniqBy('id').value() || [];
            },

            queryProjectMember: function (group) {
                return  ProjectMemberGroupBiz.fetch({
                    projectCode: '!' + group.projectId,
                    projectMemberGroupId: group.projectMemberGroupId
                }).then(function(result){
                    return  _.map(result.contents().organizationMemberIdList, function(id){
                        return {
                            type: 'member',
                            member: result.refMap.organizationMemberMap(id)
                        };
                    });
                });
            },

            queryMemberOrGroup: function (query, option) {
                return Member.searchWithParam(query, _.get(option, 'field'), _.get(option, 'typeList'), _.get(option, 'boost')).then(function(result){
                    return Converter.toMemberOrGroupFromSearchResult(result.contents());
                });
            }
        };
    }

})();
