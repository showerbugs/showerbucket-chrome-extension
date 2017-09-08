(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('InvitationResource', InvitationResource)
        .factory('InvitationBiz', InvitationBiz);

    /* @ngInject */
    function InvitationResource($resource, $cacheFactory, ApiConfigUtil) {
        var cache = $cacheFactory('InvitationResource');
        return $resource(ApiConfigUtil.wasContext() + '/invitations/:id', {
            'id': '@id'
        }, {
            'get': {method: 'GET', cache: cache},
            'query': {method: 'GET', isArray: true, cache: cache},
            'save': {url: ApiConfigUtil.wasContext() + '/invitations', method: 'POST'},
            'update': {method: 'PUT'},
            'resend': {method: 'POST', url: ApiConfigUtil.wasContext() + '/invitations/:id/resend'}
        });
    }

    /* @ngInject */
    function InvitationBiz($cacheFactory, API_PAGE_SIZE, InvitationResource, RootScopeEventBindHelper) {
        var EVENTS = {
            'RESETCACHE': 'Invitation:resetCache'
        };

        var resetCache = function () {
            $cacheFactory.get('InvitationResource').removeAll();
            RootScopeEventBindHelper.emit(EVENTS.RESETCACHE);
        };
        return {
            EVENTS: EVENTS,
            resetCache: resetCache,

            fetchListByStatus: function (param) {
                return InvitationResource.get(param).$promise;
            },

            fetchListByEmail: function (email) {
                return InvitationResource.get({'inviteeEmail': email, 'size': API_PAGE_SIZE.ALL}).$promise;
            },

            fetchListByProjectId: function (projectId, status) {
                return InvitationResource.query({'projectId': projectId, 'status': status}).$promise;
            },

            // params: {inviterName, inviteeEmail, subject, body}
            send: function (params) {
                return InvitationResource.save(params).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            },
            resend: function (invitationId, locale) {
                return InvitationResource.resend({'id': invitationId}, {locale: locale}).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            },
            cancel: function (invitationId) {
                return InvitationResource.update({'id': invitationId}, {'status': 'canceled'}).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            },
            changeRole: function (invitationId, role) {
                return InvitationResource.update({'id': invitationId}, {'invitedOrganizationRole': role}).$promise.then(function (result) {
                    resetCache();
                    return result;
                });
            }
        };
    }

})();
