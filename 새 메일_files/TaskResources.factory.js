(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TaskResource', TaskResource)
        .factory('TaskFileResource', TaskFileResource)
        .factory('TaskSearchResource', TaskSearchResource);

    /* @ngInject */
    function TaskResource($resource, API_ERROR_CODE, ApiConfigUtil) {
        //TODO
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/posts/:postNumber', {
            'projectCode': '@projectCode',
            'postNumber': '@postNumber'
        }, {
            'save': {method: 'POST'},
            'get': {
                method: 'GET',
                ignore: {
                    resultCode: [API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED, API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED],
                    responseError: function (config) {
                        //TASK/MSG는 볼수 있지만 프로젝트 권한 없을 경우가 자주 발생
                        return ( config.params && config.params.projectCode && !angular.isDefined(config.params.postNumber) );
                    }
                },
                cancellable: true
            },
            'update': {method: 'PUT', ignore: {isSuccessfulFalsy: true}},
            'remove': {method: 'DELETE', ignore: {resultCode: [API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED, API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED]}},
            'removeArray': {url: ApiConfigUtil.wasContext() + '/projects/*/posts/delete', method: 'POST', ignore: {isSuccessfulFalsy: true}},
            'complete': {url: ApiConfigUtil.wasContext() + '/projects/*/posts/set-workflow', method: 'POST', ignore: {isSuccessfulFalsy: true}},
            'simpleSave': {url: ApiConfigUtil.wasContext() + '/projects/:projectCode/posts?mode=simple', method: 'POST'}
        });
    }

    /* @ngInject */
    function TaskFileResource($resource, API_ERROR_CODE, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/:projectCode/posts/:postNumber/files/:fileId', {
            'projectCode': '@projectCode',
            'postNumber': '@postNumber',
            'fileId': '@fileId'
        }, {
            'query': {method: 'GET', cancellable: true},
            'save': {method: 'POST'},
            'remove': {method: 'DELETE', ignore: {resultCode: [API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED, API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED]}}
        });
    }

    /* @ngInject */
    function TaskSearchResource($resource, ApiConfigUtil) {
        //TODO: 이후 검색 URL 및 범위 결정 후 수정 예정
        return $resource(ApiConfigUtil.wasContext() + '/posts/search', {
            page:'@page',
            size: '@size'
        }, {
            'search': {
                method: 'POST',
                ignore: {
                    responseError: function (config) {
                        //TASK/MSG는 볼수 있지만 프로젝트 권한 없을 경우가 자주 발생
                        return ( config.params.projectCode && !angular.isDefined(config.params.postNumber) );
                    }
                },
                cancellable: true
            },
            'searchV2': {
                url: ApiConfigUtil.wasContext() + '/posts/search/v2',
                method: 'POST',
                ignore: {
                    responseError: function (config) {
                        //TASK/MSG는 볼수 있지만 프로젝트 권한 없을 경우가 자주 발생
                        return ( config.params.projectCode && !angular.isDefined(config.params.postNumber) );
                    }
                },
                cancellable: true
            }
        });
    }

})();
