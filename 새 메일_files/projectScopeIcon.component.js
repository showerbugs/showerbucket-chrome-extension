(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .component('projectScopeIcon', {
            templateUrl: 'modules/share/icons/projectScopeIcon/projectScopeIcon.html',
            controller: ProjectScopeIcon,
            bindings: {
                project: '<',
                color: '@?',
                big: '@?'
            }
        });

    /* @ngInject */
    function ProjectScopeIcon(PROJECT_API_PARAM_NAMES, _) {
        var $ctrl = this;
        $ctrl.$onChanges = function () {
            if ($ctrl.project) {
                $ctrl.projectScope = _calcProjectScope($ctrl.project);
            } else {
                $ctrl.projectScope = null;
            }
        };

        function _calcProjectScope(project) {
            if (project.scope === PROJECT_API_PARAM_NAMES.SCOPE.PRIVATE) {
                return 'private';
            }

            var permission = _.get(project.publicPermissionList[0], 'permission');
            return _.isEqual(permission, PROJECT_API_PARAM_NAMES.PUBLIC_SCOPE_PERMISSIONS.WRITE_ONLY) ?
                'writeOpen' : 'public';
        }
    }

})();
