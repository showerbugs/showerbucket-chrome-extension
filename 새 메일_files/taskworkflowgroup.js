(function () {
    'use strict';

    angular.module('doorayWebApp.components')
        .filter('postWorkflowGroup', postWorkflowGroup);

    /* @ngInject */
    function postWorkflowGroup(gettextCatalog, _) {
        return function (posts, param) {
            var currentWorkflowClass,
                target = param.target,
                classNameDescMap = {
                    'registered': gettextCatalog.getString('등록'),
                    'working': gettextCatalog.getString('진행 중'),
                    'closed': gettextCatalog.getString('완료'),
                    'null': gettextCatalog.getString('없음.1')
                };

            //tmpObject = 일시적으로 workflow이름들에 멤버변수(배열:posts)를 갖는다
            _.forEach(posts, function (post) {
                var workflowClass = getWorkflowClass(target, post);
                if (workflowClass !== currentWorkflowClass) {
                    currentWorkflowClass = workflowClass;
                    post._getOrSetProp('groupId', workflowClass || 'null');
                    post._getOrSetProp('groupName', classNameDescMap[workflowClass] || gettextCatalog.getString('없음'));
                }
            });

            return posts;
        };

        function getWorkflowClass(target, post) {
            if (post.dueDateFlag) {
                return target === 'post' ? post.workflowClass : _.get(post._getOrSetProp('myInfo'), '_workflowClass');
            } else {
                return null;
            }
        }
    }
})();





