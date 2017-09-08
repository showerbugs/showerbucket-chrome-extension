(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .factory('TranslatorResource', TranslatorResource)
        .factory('TranslatorRepository', TranslatorRepository);

    /* @ngInject */
    function TranslatorResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/settings/translator', {}, {
            'get': {method: 'GET'},
            'update': {method: 'PUT'}
        });
    }

    /* @ngInject */
    function TranslatorRepository(TranslatorResource) {
        var viewModel = {};

        return {
            fetchAndCache: fetchAndCache,
            getModel: getModel,
            update: update
        };

        function fetchAndCache() {
            return TranslatorResource.get().$promise.then(function (res) {
                viewModel = res.contents();
            });
        }

        function getModel() {
            return viewModel;
        }

        function update(param) {
            return TranslatorResource.update(param).$promise;
        }
    }

})();
