(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('VersionService', VersionService);

    /* @ngInject */
    function VersionService($timeout, RootScopeEventBindHelper, VersionResource, _) {
        var EVENTS = {
            'CHANGED': 'VersionService:changed'
        }, randomTimer = Math.random() * 120 * 60 * 1000; // 2시간

        var buildTimestamp,
            promise,
            timestamp;
        // Public API here
        return {
            EVENTS: EVENTS,
            fetchAndCompare: function () {
                promise = VersionResource.get({timestamp: Date.now()}).$promise.then(function (results) {
                    timestamp = results.result().timestamp;
                    if (_.isUndefined(buildTimestamp)) {
                        buildTimestamp = timestamp;
                    }
                    if (!_.isEqual(buildTimestamp, timestamp)) {
                        $timeout(function () {
                            RootScopeEventBindHelper.emit(EVENTS.CHANGED, timestamp, buildTimestamp);
                        }, randomTimer, false);
                    }
                    return results;
                });
                return promise;
            },
            hasNewVersion: function () {
                return !_.isEqual(buildTimestamp, timestamp);
            },
            getVersionPromise: function () {
                return _getOrFetchPromise.call(this).then(function () {
                    return timestamp;
                });
            }
        };

        function _getOrFetchPromise() {
            return promise ? promise : this.fetchAndCompare();
        }
    }

})();
