(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .component('pageGlobalNaviBar', {
            templateUrl: 'modules/share/header/pageGlobalNaviBar/pageGlobalNaviBar.html',
            controller: PageGlobalNaviBar
        });

    /* @ngInject */
    function PageGlobalNaviBar($state, $window, MAIL_STATE_NAMES, PROJECT_STATE_NAMES,
                               HelperConfigUtil, MailCountRepository, ProjectCountRepository, StreamCountRepository, StreamModalFactory, _) {
        var $ctrl = this,
            useService = HelperConfigUtil.serviceUse(),
            enableNewFeature = HelperConfigUtil.enableNewFeature();

        var serviceCountRepositories = {
            stream: StreamCountRepository,
            project: ProjectCountRepository,
            mail: MailCountRepository
        };

        $ctrl.PROJECT_STATE_NAMES = PROJECT_STATE_NAMES;
        $ctrl.MAIL_STATE_NAMES = MAIL_STATE_NAMES;
        $ctrl.StreamModalFactory = StreamModalFactory;

        $ctrl.$onInit = function () {
            $ctrl.activeService = 'mail';
            $ctrl.stream = {
                show: enableNewFeature || _.isBoolean(useService.project) || _.isBoolean(useService.mail),
                disabled: !enableNewFeature && !useService.project && !useService.mail
            };
            $ctrl.project = {
                show: enableNewFeature|| _.isBoolean(useService.project),
                rootState: PROJECT_STATE_NAMES.PROJECT_STATE,
                goState: PROJECT_STATE_NAMES.TO_BOX,
                disabled: !enableNewFeature && !useService.project
            };
            $ctrl.mail = {
                show: enableNewFeature || _.isBoolean(useService.mail),
                rootState: MAIL_STATE_NAMES.ROOT,
                goState: MAIL_STATE_NAMES.INBOX,
                disabled: !enableNewFeature && !useService.mail
            };
            $ctrl.calendar = {
                show: enableNewFeature || _.isBoolean(useService.calendar),
                rootState: 'main.page.calendar',
                goState: 'main.page.calendar',
                disabled: !enableNewFeature && !useService.calendar
            };
        };

        // -------- declare method --------

        $ctrl.openStreamModal = openStreamModal;
        $ctrl.getServiceTotalCounts = getServiceTotalCounts;
        $ctrl.isActiveService = isActiveService;
        $ctrl.reloadPageOptional = reloadPageOptional;

        // -------- define method ---------

        function openStreamModal() {
            StreamModalFactory.open();
        }

        function getServiceTotalCounts(serviceName) {
            if (isActiveService(serviceName) || $ctrl[serviceName].disabled) {
                return 0;
            }

            return Math.min(_.result(serviceCountRepositories[serviceName], 'getTotalCount', 0), 99);
        }

        function isActiveService(serviceName) {
            return _.startsWith($state.current.name, $ctrl[serviceName].rootState);
        }

        function reloadPageOptional(serviceName) {
            if (isActiveService(serviceName)) {
                $window.location.pathname = $state.href($ctrl[serviceName].goState);
            }
        }
    }

})();
