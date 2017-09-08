(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('removedPostInfoCard', {
            templateUrl: 'modules/project/components/removedPostInfoCard/removedPostInfoCard.html',
            bindings: {
                removedPostInfo: '<'
            }
        });

})();
