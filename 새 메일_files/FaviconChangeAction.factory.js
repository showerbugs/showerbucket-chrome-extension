(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('FaviconChangeAction', FaviconChangeAction);

    /* @ngInject */
    function FaviconChangeAction($location, HelperConfigUtil, ServiceUseRouter, VersionService, moment, _) {
        var VERSION = 4,
            FAV_FOLDER_URL = '/assets/images/favicons',
            folderUrl = '',
            currentServiceName = '';
        return {
            applyCurrentServiceFavicon: applyCurrentServiceFavicon,
            applyCurrentEnvFavicon: applyCurrentEnvFavicon
        };

        function applyCurrentServiceFavicon() {
            VersionService.getVersionPromise().then(function (version) {
                var _folderUrl = _getFolderUrl(version),
                    serviceName = _findCurrentService();
                if (currentServiceName === serviceName || !serviceName) {
                    return;
                }
                currentServiceName = serviceName;

                if (serviceName === 'calendar') {
                    _applyFaviconUrl([_folderUrl, '/fav_', serviceName, '_', moment().format('DD'), '.ico'].join(''));
                    return serviceName;
                }
                _applyFaviconUrl([_folderUrl, '/fav_', serviceName, '.ico'].join(''));
                return serviceName;
            });

        }

        function applyCurrentEnvFavicon() {
            var _folderUrl = _getFolderUrl(),
                env = HelperConfigUtil.env();
            if (env !== 'real') {
                _applyFaviconUrl([_folderUrl, '/fav_', env, '.ico'].join(''));
                return env;
            }
        }

        function _getFolderUrl(version) {
            if (folderUrl) {
                return folderUrl;
            }
            if (HelperConfigUtil.env() === 'local') {
                folderUrl = FAV_FOLDER_URL;
                return folderUrl;
            }
            folderUrl = ['/dist/', version, FAV_FOLDER_URL].join('');
            return folderUrl;
        }

        function _findCurrentService() {
            var url = $location.url();

            if (_.startsWith(url, '/org')) {
                return;
            }

            if (url === '/') {
                var service = ServiceUseRouter.findCanRouteService();
                return service !== 'default' && service;
            }

            if (_.startsWith(url, '/project') || _.startsWith(url, '/popup/project')) {
                return 'project';
            }

            if (_.includes(url, 'mail')) {
                return 'mail';
            }

            if (_.includes(url, 'calendar')) {
                return 'calendar';
            }
        }

        function _applyFaviconUrl(url) {
            var favicon$ = angular.element('#favicon');

            favicon$.attr('href', [url, '?version=', VERSION].join(''));
        }
    }

})();
