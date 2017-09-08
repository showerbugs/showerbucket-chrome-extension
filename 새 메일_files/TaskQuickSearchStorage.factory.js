(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TaskQuickSearchStorage', TaskQuickSearchStorage);

    /* @ngInject */
    function TaskQuickSearchStorage(Member, MyCryptoJSStorage, _) {
        var TASK_KEY = 'tasks',
            MENTION_KEY = 'mention',
            MAX_SAVE_LENGTH = 30,
            MAX_SHOW_LENGTH = 20,
            myInfo;

        Member.fetchMyInfo().then(function (result) {
            myInfo = result.contents();
        });
        var getTaskObj = function (data) {
            return {
                'id': data.id,
                'type': data.type,
                'projectCode': _.get(data, 'projectCode'),
                'taskName': data.subject || '',
                'postNumber': data.number,
                'parent': data.parent,
                'creator': _.get(data, 'users.from.member.name'),
                'workflowClass': data.workflowClass
            };
        };
        var setOrderStack = function (tasks, id) {
            var orderStack = tasks.orderStack || [], length = orderStack.length;

            _.remove(orderStack, function (n) {
                return n === id;
            });
            orderStack.unshift(id);

            if (length >= MAX_SAVE_LENGTH) {
                delete tasks[orderStack.pop()];
            }
            tasks.orderStack = orderStack;
        };

        return {
            get: function (key) {
                return MyCryptoJSStorage.get(key);
            },

            set: function (key, valueObj) {
                MyCryptoJSStorage.set(key, valueObj);
            },

            //data {projectCode, postId, taskTitle, projectOwner, userId}
            setRecentTasks: function (data) {
                if (data && data.id) {
                    var tasks = this.get(TASK_KEY) || {};
                    setOrderStack(tasks, data.id);
                    tasks[data.id] = getTaskObj(data);
                    this.set(TASK_KEY, tasks);
                }
            },

            getRecentTasks: function (projectCode, postNumber) {
                var tasks, orderStack, i, length, result = [];
                tasks = this.get(TASK_KEY) || {};
                orderStack = tasks.orderStack || [];

                length = orderStack.length > MAX_SHOW_LENGTH ? MAX_SHOW_LENGTH : orderStack.length;
                for (i = 0; i < length; i++) {
                    if (tasks[orderStack[i]].projectCode !== projectCode || tasks[orderStack[i]].postNumber !== postNumber) {
                        result.push(tasks[orderStack[i]]);
                    }
                }
                return result;
            },

            searchInProject: function (projectCode) {
                var tasks, orderStack, result = [];
                tasks = this.get(TASK_KEY) || {};
                orderStack = tasks.orderStack || [];

                _.forEach(orderStack, function (order) {
                    if (tasks[order].projectCode === projectCode) {
                        result.push(tasks[order]);
                    }
                });
                return result;
            },

            search: function (word) {
                var tasks = this.get(TASK_KEY) || {}, result = [];
                delete tasks.orderStack;
                //현재 찾는 목록 : 테스크 이름, 프로젝트 코드 TODO: 스팩추가..
                _.forEach(tasks, function (value) {
                    if (result.length < MAX_SHOW_LENGTH) {
                        //value.projectCode.indexOf(word) !== -1 ||
                        if (value.taskName.indexOf(word) >= 0) {
                            result.push(value);
                        }
                    }
                });
                return result;
            },

            setMentionMember: function (member) {
                if(!member || member.length === 0) {
                    return;
                }
                var data = this.get(MENTION_KEY) || {ids: []};
                member = _.isArray(member) ? member: [member];
                data.ids = _(member).filter({type: 'member'}).map('member')
                    .concat(_(member).filter({type: 'group'}).map('group.members').flatten().map('member').value()).map('id')
                    .concat(data.ids).uniq().compact().take(MAX_SAVE_LENGTH).value();

                this.set(MENTION_KEY, data);
            },

            getMentionMember: function () {
                return _.get(this.get(MENTION_KEY), 'ids', [myInfo.id]);
            }
        };
    }

})();
