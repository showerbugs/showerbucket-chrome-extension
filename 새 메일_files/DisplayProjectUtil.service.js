(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .service('DisplayBoxUtil', DisplayBoxUtil);

    /* @ngInject */
    function DisplayBoxUtil(gettextCatalog) {
        this.makeScopeFullName = function (scope) {
            if (scope) {
                return scope === 'public' ? gettextCatalog.getString('공개 프로젝트') : gettextCatalog.getString('일반 프로젝트');
            }
            return '';
        };

        this.makeShortName = function (name) {
            return name.substring(0, 2);
        };
    }

})();
