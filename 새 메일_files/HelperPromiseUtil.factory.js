(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .factory('HelperPromiseUtil', HelperPromiseUtil);

    /* @ngInject */
    function HelperPromiseUtil(_) {
        return {
            isResourcePending: isResourcePending,
            isPromiseLike: isPromiseLike,
            cancelResource: cancelResource
        };

        function isResourcePending(resourceOrPromise) {
            return _.get(resourceOrPromise, '$$state.status') === 0 || _.get(resourceOrPromise, '$promise.$$state.status') === 0;
        }

        function isPromiseLike(obj) {
            return obj && _.isFunction(obj.then);
        }

        function isResourceLike(obj) {
            return obj && _.isPlainObject(_.get(obj, '$promise.$$state'));
        }

        function cancelResource(ngResource) {
            if (isResourceLike(ngResource) && isResourcePending(ngResource)) {
                _.result(ngResource, '$cancelRequest');
            }
        }
    }

})();
