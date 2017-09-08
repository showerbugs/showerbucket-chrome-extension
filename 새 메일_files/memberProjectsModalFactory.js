(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .factory('MemberProjectsModalFactory', MemberProjectsModalFactory)
        .controller('MemberProjectsModalCtrl', MemberProjectsModalCtrl);


    /* @ngInject */
    function MemberProjectsModalFactory ($uibModal) {
        return {
            open: function (memberId) {
                return $uibModal.open({
                    'templateUrl': 'modules/setting/common/project/memberProjectsModal/memberProjectsModal.html',
                    'controller': 'MemberProjectsModalCtrl',
                    'windowClass': 'setting-modal member-projects-modal dooray-setting-content',
                    'resolve': {
                        'memberId': function () {
                            return memberId;
                        }
                    }
                });
            }
        };
    }

    /* @ngInject */
    function MemberProjectsModalCtrl ($scope, $uibModalInstance, API_PAGE_SIZE, memberId, Project, _) {
        $scope.pageItemListSize = API_PAGE_SIZE.ALL;

        $scope.close = function () {
            $uibModalInstance.dismiss();
        };

        function projectMemberInfoFilter (list) {
            _.forEach(list, function (project) {
                project._getOrSetProp('role', _.get(_.find(project.projectMemberList, {'organizationMemberId': memberId}), 'role'));
                project._memberInfo = _.find(project.members, {'id': memberId});
            });
        }
        function fetchProject () {
            Project.fetchListByMemberId(memberId, Project.PARAM_NAMES.EXT_FIELDS.MEMBERS).then(function (result) {
                $scope.activeProjects = _.filter(result.contents(), {'state': Project.PARAM_NAMES.STATE.ACTIVE});
                $scope.archivedProjects = _.filter(result.contents(), {'state': Project.PARAM_NAMES.STATE.ARCHIVED});
                projectMemberInfoFilter($scope.activeProjects.concat($scope.archivedProjects));
            });
        }
        fetchProject();

    }

})();




