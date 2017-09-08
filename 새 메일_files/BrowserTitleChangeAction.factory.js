(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('BrowserTitleChangeAction', BrowserTitleChangeAction);

    /* @ngInject */
    function BrowserTitleChangeAction($document, $q, TenantRepository, _) {
        return {
            changeBrowserTitle: changeBrowserTitle
        };

        function changeBrowserTitle(subTitle) {
            _promiseTenantInfo().then(function () {
                $document[0].title = [subTitle, TenantRepository.getModel().name, 'Dooray!'].join(' : ');
            });
        }

        function _promiseTenantInfo() {
            return _.isEmpty(TenantRepository.getModel()) ?
                TenantRepository.fetchAndCache() : $q.when();
        }
    }

})();
