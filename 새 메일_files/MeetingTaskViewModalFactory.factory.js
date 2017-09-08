(function () {

    'use strict';

    angular.module('doorayWebApp.project')
        .factory('MeetingTaskViewModalFactory', MeetingTaskViewModalFactory)
        .controller('MeetingTaskViewCtrl', MeetingTaskViewCtrl);

    /* @ngInject */
    function MeetingTaskViewModalFactory($uibModal, DetailInstanceFactory, ITEM_TYPE) {
        var openedModalInstances = {};
        var openModal = function (task, templateUrl) {
            var modalInstance,
                id = '' + task.data.id;

            if(openedModalInstances[id]) {
                id += Date.now();
            }

            modalInstance = $uibModal.open({
                'templateUrl': templateUrl || 'modules/project/view/MeetingTaskView/meetingTaskView.html',
                'controller': 'MeetingTaskViewCtrl',
                'windowClass': 'setting-modal commonview',
                'resolve': {
                    'task': function () {
                        return task;
                    }
                }
            });
            openedModalInstances[id] = modalInstance;
            modalInstance.closed.then(function () {
                delete openedModalInstances[id];
            });

            return modalInstance;
        };

        return {
            isOpenedMeetingView: function () {
                return !_.isEmpty(openedModalInstances);
            },
            open: function (task, templateUrl) {
                return openModal(task, templateUrl);
            },
            openByParam: function (projectCode, postNumber, templateUrl) {
                var task = DetailInstanceFactory.getOrMakeModalItem(ITEM_TYPE.POST);
                return task.setParam(projectCode, postNumber).then(function () {
                    return openModal(task, templateUrl);
                });
            }
        };

    }

    /* @ngInject */
    function MeetingTaskViewCtrl($scope, $uibModalInstance, task, MIME_TYPE) {
        $scope.selectedTask = task;
        $scope.MIME_TYPE = MIME_TYPE;
        $scope.showAlert = true;

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.closeAlert = function () {
            $scope.showAlert = false;
        };

        $scope.$on('$stateChangeSuccess', function () {
            $scope.cancel();
        });

    }
})();
