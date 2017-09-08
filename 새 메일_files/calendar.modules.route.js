(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .run(runInitializeUiRouter);

    /* @ngInject */
    function runInitializeUiRouter(Router) {
        registerStateInfos();

        function registerStateInfos() {
            Router.registerState({
                'name': 'main.page.calendar',
                'url': '/calendar',
                'views': {
                    'body@main': {
                        'templateUrl': 'modules/calendar/body/calendarBody.html'
                    }
                },
                'onEnter': onEnterCalendarState
            });

            /* @ngInject */
            function onEnterCalendarState(ListBizWrapperByType, ServiceUseRouter, WelcomeGuideModalFactory) {
                if (!ServiceUseRouter.routeToUsingService('calendar')) {
                    ListBizWrapperByType.selectBizWrapper('calendar');
                    WelcomeGuideModalFactory.openIfFirstType('calendar');
                }
            }
        }
    }

})();
