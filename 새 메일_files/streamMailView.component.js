(function () {

    'use strict';

    angular
        .module('doorayWebApp.stream')
        .component('streamMailView', {
            templateUrl: 'modules/stream/view/streamMailView/streamMailView.html',
            controller: StreamMailView
        });

    /* @ngInject */
    function StreamMailView(MailStreamViewRepository) {
        var $ctrl = this;

        $ctrl.MailStreamViewRepository = MailStreamViewRepository;
        $ctrl.closeMailView = closeMailView;

        function closeMailView() {
            MailStreamViewRepository.clear();
        }

    }

})();
