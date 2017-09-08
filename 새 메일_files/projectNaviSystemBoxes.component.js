(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('projectNaviSystemBoxes', {
            templateUrl: 'modules/project/navi/projectNaviSystemBoxes/projectNaviSystemBoxes.html',
            /* @ngInject */
            controller: function ($scope, $state, EMIT_EVENTS, PROJECT_STATE_NAMES, ProjectCountRepository, ProjectUtil, gettextCatalog, _) {
                var $ctrl = this;
                $ctrl.systemBoxList = ProjectUtil.getShowSystemProjectList();

                $ctrl.isDraftBox = isDraftBox;
                $ctrl.isActiveBox = isActiveBox;
                $ctrl.getDisplayBoxCount = getDisplayBoxCount;

                function isDraftBox(item) {
                    return item.state.lastIndexOf('draft') > -1;
                }

                function isActiveBox(item) {
                    return $state.current.name.indexOf(item.state) > -1;
                }

                function getDisplayBoxCount(boxInfo) {
                    return _.get(ProjectCountRepository.getModel(), boxInfo.countPath, 0);
                }
            }
        });
})();
