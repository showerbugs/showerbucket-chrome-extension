(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('layerTaskview', LayerTaskview)
        .directive('taskReference', TaskReference);

    /* @ngInject */
    function LayerTaskview(TaskViewModalFactory, $state, $compile, PROJECT_STATE_NAMES) {
        return {
            restrict: 'A',
            scope: {
                projectCode: '@',
                postNumber: '@'
            },

            link: function (scope, element) {
                var url = $state.href(PROJECT_STATE_NAMES.PROJECT_BOX + '.view', {
                    'projectCode': scope.projectCode,
                    'postNumber': scope.postNumber
                });

                element.attr('href', url);
                element.on('click', function (e) {
                    TaskViewModalFactory.openModal(scope.projectCode, scope.postNumber);
                    e.preventDefault();
                    e.stopPropagation();
                });

                $compile(element.contents())(scope);

                scope.$on('$destroy', function () {
                    element.off('click');
                });
            }
        };
    }

    /* @ngInject */
    function TaskReference(TaskViewModalFactory, MeetingTaskViewModalFactory, SYNTAX_REGEX, _) {
        return {
            restrict: 'C',
            link: function (scope, element) {
                var text = element.contents(),
                    cor = SYNTAX_REGEX.task.exec(_.get(text, '[0].nodeValue'));

                if (cor) {
                    var projectCode = cor[1],
                        postNumber = cor[2];

                    // 쓰기창에서 중복으로 호출되는 문제가 있어서 리스너 제거 후 추가
                    element.off('click');
                    element.on('click', function (e) {
                        e.preventDefault();

                        if (MeetingTaskViewModalFactory.isOpenedMeetingView()) {
                            MeetingTaskViewModalFactory.openByParam(projectCode, postNumber);
                            return;
                        }

                        TaskViewModalFactory.openModal(projectCode, postNumber);
                        e.stopPropagation();
                    });
                }

                scope.$on('$destroy', function () {
                    element.off('click');
                });
            }
        };
    }

})();
