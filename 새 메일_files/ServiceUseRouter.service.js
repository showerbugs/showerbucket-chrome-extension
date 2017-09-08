(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .service('ServiceUseRouter', ServiceUseRouter);

    /* @ngInject */
    function ServiceUseRouter($state, MAIL_STATE_NAMES, PROJECT_STATE_NAMES, HelperConfigUtil, _) {
        //TODO MAIL_STATE_NAMES, PROJECT_STATE_NAMES 의존성 이후에 제거해야함
        var serviceOrder = ['project', 'mail', 'calendar'],
            defaultStateMap = {
            project: {
                stateName: PROJECT_STATE_NAMES.TO_BOX,
                stateParams: {filterStoreMode: true}
            },
            mail: {
                stateName: MAIL_STATE_NAMES.INBOX
            },
            calendar: {
                stateName: 'main.page.calendar'
            },
            default: {
                stateName: 'main.page.empty'
            }
        };
        return {
            routeToUsingService: routeToUsingService,
            routeCanPossibleService: routeCanPossibleService,
            findCanRouteService: findCanRouteService
        };

        function routeToUsingService(inServiceName) {
            var useService = HelperConfigUtil.serviceUse();

            if (HelperConfigUtil.enableNewFeature() || useService[inServiceName]) {
                return false;
            }

            $state.go('main.page.empty', {}, {inherit: false});
            return true;
        }

        function routeCanPossibleService() {
            var target = defaultStateMap[findCanRouteService()];
            $state.go(target.stateName, target.stateParams || {});
        }

        function findCanRouteService() {
            var serviceUse = HelperConfigUtil.serviceUse(),
                enableNewFeature = HelperConfigUtil.enableNewFeature();

            var serviceName = _.find(serviceOrder, function (serviceName) {
                if (enableNewFeature || (serviceUse[serviceName] && (serviceName === 'project' || serviceName === 'mail'))) {
                    return true;
                }
            });
            return serviceName || 'default';
        }
    }

})();
