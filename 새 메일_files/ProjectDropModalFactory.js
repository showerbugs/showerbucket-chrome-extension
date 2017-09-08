(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .factory('ProjectDropModalFactory', ProjectDropModalFactory)
        .controller('ProjectDropCtrl', ProjectDropCtrl);

    /* @ngInject */
    function ProjectDropModalFactory($uibModal) {
        var TYPE = {
            REMOVE: 'remove',
            LEAVE: 'leave'
        };

        function makeModal(type, projectCode, postCount, memberId) {
            return {
                'templateUrl': type === TYPE.REMOVE ?
                    'modules/setting/common/project/ProjectDropModalFactory/removeProjectMember.html' :
                    'modules/setting/common/project/ProjectDropModalFactory/leaveProject.html',
                'controller': 'ProjectDropCtrl',
                'windowClass' : 'message-modal project-drop dooray-setting-content',
                'resolve': {
                    'projectCode': function () {
                        return projectCode;
                    },
                    'projectTaskCount': function () {
                        return postCount;
                    },
                    'memberId': function () {
                        return memberId || 'me';
                    }
                }
            };
        }

        return {
            openRemoveModal: function (projectCode, postCount, memberId) {
                return $uibModal.open(makeModal(TYPE.REMOVE, projectCode, postCount, memberId));
            },
            openLeaveModal: function (projectCode, postCount, memberId) {
                return $uibModal.open(makeModal(TYPE.LEAVE, projectCode, postCount, memberId));
            }
        };
    }

    /* @ngInject */
    function ProjectDropCtrl($scope, projectCode, memberId, $uibModalInstance, ProjectMemberBiz, projectTaskCount) {

        $scope.projectTaskCount = projectTaskCount;

        $scope.ok = function () {
            ProjectMemberBiz.remove(projectCode, memberId).then(function () {
                $uibModalInstance.close('success');
            }, function () {
                $uibModalInstance.dismiss('cancel');
            });
        };

        $scope.cancel = function(){
            $uibModalInstance.dismiss('cancel');
        };
    }


})();

