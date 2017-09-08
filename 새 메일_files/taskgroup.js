(function () {
    'use strict';

    angular.module('doorayWebApp.components')
        .filter('postGroup', postGroup);

    /* @ngInject */
    function postGroup(HumanReadableDateTimeUtil, gettextCatalog, moment, _) {
        var currentGroupId = null,
            currentGroupInfo,
            currentGroupInfoIndex,
            targetMomemt;

        // params = {'target': 'createdAt|dueDate', 'type': 'PAST|FUTURE', 'reverse': true}
        return function (posts, params) {
            return makeTaskGroup(posts, params);
        };

        function makeTaskGroup(posts, params) {
            var groupInfo = HumanReadableDateTimeUtil.DATE[params.type],
                boundInfo = HumanReadableDateTimeUtil.DATE[params.type + '_BOUNDARY'];

            currentGroupId = null;
            currentGroupInfoIndex = params.reverse ? groupInfo.length - 1 : 0;
            currentGroupInfo = groupInfo[currentGroupInfoIndex];

            _.forEach(posts, function (post) {
                // dueDate정렬일 때에 정렬순서가 반대가 될 수 있어서 앞에서 거름
                if (params.target === 'dueDate' && !hasDueDate(post)) {
                    assignNotDateGroupInfoInDueDate(post);
                    return;
                }

                targetMomemt = moment(post[params.target]);

                // 지정한 값을 넘어가면 년단위로 노출
                if (post[params.target] && isOutOfBoundary(boundInfo)) {
                    assignYearGroupInfo(post);
                    return;
                }

                // 기간안에 정보가 있을 때 정보 assign 후 다음 loop실행
                assignHasDateGroupInfoInDuration(post, params, groupInfo);
            });

            return posts;
        }

        function setGroupInfo(post, groupId, groupName) {
            currentGroupId = groupId;
            post._getOrSetProp('groupId', groupId);
            post._getOrSetProp('groupName', groupName);
        }

        function assignNotDateGroupInfoInDueDate(post) {
            var groupId = post.dueDateFlag ? 'unplanned': 'none',
                groupName = post.dueDateFlag ? gettextCatalog.getString('미정') : gettextCatalog.getString('없음.1');

            if (groupId === currentGroupId) {
                return;
            }
            setGroupInfo(post, groupId, groupName);
        }

        function assignHasDateGroupInfoInDuration(post, params, groupInfo) {

            while (currentGroupInfo) {
                if (isInRange(currentGroupInfo.range)) {
                    if (currentGroupId !== currentGroupInfo.id) {
                        setGroupInfo(post, currentGroupInfo.id, currentGroupInfo.name);
                    }
                    return true;
                } else {
                    currentGroupInfoIndex += params.reverse ? -1 : 1;
                    currentGroupInfo = groupInfo[currentGroupInfoIndex];
                }
            }
        }

        function assignYearGroupInfo(post) {
            var postYear = targetMomemt.year(),
                groupId = '_' + postYear;
            if (groupId !== currentGroupId) {
                setGroupInfo(post, groupId, moment.duration(postYear, 'years').humanize());
            }
        }

        function isOutOfBoundary(boundInfo) {
            var date = targetMomemt,
                boundary = boundInfo.range[boundInfo.id];
            return boundInfo.id === 'end' ? date.isAfter(boundary) : date.isBefore(boundary);

        }

        function isInRange(range) {
            var date = targetMomemt;
            return (date.isAfter(range.start) || date.isSame(range.start)) &&
                (date.isBefore(range.end) || date.isSame(range.end));
        }

        function hasDueDate(post) {
            return post.dueDateFlag && post.dueDate;
        }
    }


})();
