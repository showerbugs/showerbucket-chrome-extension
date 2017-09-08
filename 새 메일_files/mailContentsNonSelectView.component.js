(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailContentsNonSelectView', {
            templateUrl: 'modules/mail/view/mailContentsNonSelectView/mailContentsNonSelectView.html',
            controller: MailContentsNonSelectView,
            bindings: {
                item: '<'
            }
        });

    /* @ngInject */
    function MailContentsNonSelectView(MailFolderInputRepository) {
        var $ctrl = this;
        $ctrl.MailFolderInputRepository = MailFolderInputRepository;

        //PreDefined Callback;

        this.$onInit = function () {
        };

        this.$onChanges = function (/*changes*/) {
        };

        this.$onDestroy = function () {
        };

        //TODO IMPLEMENTS

    }

})();
