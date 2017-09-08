(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailFullListFilecountItem', {
            templateUrl: 'modules/mail/contents/fullListItems/mailFullListFilecountItem/mailFullListFilecountItem.html',
            bindings: {
                mail: '<'
            }
        });

})();
