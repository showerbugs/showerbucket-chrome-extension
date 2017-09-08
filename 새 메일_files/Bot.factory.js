(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('BotResource', BotResource)
        .factory('Bot', Bot);

    /* @ngInject */
    function BotResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.orgContext() + '/bots/:botId', {
            'botId': '@botId'
        }, {
            'get': {method: 'GET'},
            'save': {method: 'POST'},
            'update': {method: 'PUT'},
            'delete': {method: 'DELETE'}
        });
    }

    /* @ngInject */
    function Bot(API_PAGE_SIZE, BotResource, MyInfo, _) {
        var resourceList = ['get', 'save', 'query', 'remove', 'delete', 'update'],
            resource = createDefaultOrgResource();
        return {
            add: function (bot) {
                return resource.save({}, [bot]).$promise.then(function (result) {
                    return result;
                });
            },
            update: function (bot) {
                return resource.update({botId: bot.id}, bot).$promise.then(function (result) {
                    return result;
                });
            },
            delete: function (bot) {
                return resource.delete({botId: bot.id}).$promise.then(function (result) {
                    return result;
                });
            },
            get: function (botId) {
                return resource.get({botId: botId}).$promise.then(function (result) {
                    return result;
                });
            },
            fetchMyList: function () {
                return resource.get({createMember: 'me', size: API_PAGE_SIZE.ALL, page: 0}).$promise.then(function (result) {
                    return result;
                });
            }
        };

        function createDefaultOrgResource() {
            var defaultOrg = {code: null},
                resource = {};
            MyInfo.getMyOrgList().then(function (orgList) {
                defaultOrg.code = _.get(orgList, '[0].code');
            });
            _.forEach(BotResource, function (value, key) {
                if (!_.includes(resourceList, key)) {
                    resource[key] = value;
                }
                resource[key] = function () {
                    arguments[0] = arguments[0] || {};
                    arguments[0].orgCode = defaultOrg.code;
                    return value.apply(null, arguments);
                };
            });
            return resource;
        }
    }


})();
