(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('PostTranslationStorageAction', PostTranslationStorageAction);

    /* @ngInject */
    function PostTranslationStorageAction(TranslationStorageBuilder) {
        return new TranslationStorageBuilder('postTranslationInfo');
    }

})();
