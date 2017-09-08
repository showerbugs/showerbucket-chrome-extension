(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('CurrentListProjectRepository', CurrentListProjectRepository);

    /* @ngInject */
    function CurrentListProjectRepository(HelperPromiseUtil, ProjectResource, _) {
        var paramCache = {},
            model = {},
            promise = null;

        return {
            reset: reset,
            fetchAndCache: fetchAndCache,
            getModel: getModel,
            getCurrentParam: getCurrentParam,
            hasProjectModelAbout: hasProjectModelAbout
        };

        function reset() {
            model = {};
            paramCache = {};
            promise = null;
        }

        function fetchAndCache(param) {
            HelperPromiseUtil.cancelResource(promise);
            // TODO 추후에 get으로 변경
            promise = ProjectResource.getWithoutCache(param);
            return promise.$promise.then(function (res) {
                paramCache = param;
                model = res.contents();
                return model;
            });
        }

        function getModel() {
            return model;
        }

        function getCurrentParam() {
            return paramCache;
        }

        function hasProjectModelAbout(projectCode) {
            return _.get(paramCache, 'projectCode') === projectCode;
        }
    }

})();
