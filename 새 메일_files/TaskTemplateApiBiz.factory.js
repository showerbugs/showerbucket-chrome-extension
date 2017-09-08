(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .constant('TEMPLATE_MAX_SIZE', 50)
        .factory('TaskTemplateApiBiz', TaskTemplateApiBiz);

    /* @ngInject */
    function TaskTemplateApiBiz($cacheFactory, TEMPLATE_MAX_SIZE, RootScopeEventBindHelper, TaskTemplateResource, _) {
        var EVENTS = {
            'RESETCACHE': 'TaskTemplateApiBiz:resetCache'
        };

        var resetCache = function () {
            $cacheFactory.get('TaskTemplateResource').removeAll();
            RootScopeEventBindHelper.emit(EVENTS.RESETCACHE);
        };

        var makePathParam = function (projectCode, templateId) {
            return {
                projectCode: projectCode,
                templateId: templateId
            };
        };

        return {
            EVENTS: EVENTS,
            resetCache: resetCache,
            query: function (projectCode) {
                return TaskTemplateResource.query({projectCode: projectCode, size: TEMPLATE_MAX_SIZE, page: 0}).$promise;
            },
            get: function (projectCode, templateId, isInterpolation) {  //param.interpolation -> 서버에서 ${var} 변수를 치환 여부 default:false
                var additionalParam = (isInterpolation === true) ? {interpolation: isInterpolation} : {};
                return TaskTemplateResource.get(_.assign(makePathParam(projectCode, templateId), additionalParam)).$promise;
            },
            setOrder: function (projectCode, templateIdList) {
                return TaskTemplateResource.setOrder({projectCode: projectCode}, templateIdList).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            },
            add: function (projectCode, params) {
                return TaskTemplateResource.save({projectCode: projectCode}, [params]).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            },
            update: function (projectCode, template) {
                return TaskTemplateResource.update(makePathParam(projectCode, template.id), template).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            },
            remove: function (projectCode, templateId) {
                return TaskTemplateResource.remove(makePathParam(projectCode, templateId)).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            }
        };
    }

})();
