(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .service('WebSocketService', WebSocketService);

    /* @ngInject */
    function WebSocketService($interval, $log, $rootScope, $websocket, $window, BROWSERS,
                              HelperConfigUtil, deviceDetector, _) {
        var closedForceFlag = false,
            RECONNECT_INTERVAL_TIME = 5000;

        var isChrome = function () {
            return deviceDetector.browser === BROWSERS.CHROME;
        };

        var WebSocket = angular.element.inherit({
            __constructor: function (param, onOpen) {
                this._subscribeQueue = [];
                this._param = param;
                this._onOpen = onOpen;

                this.reset();
            },
            reset: function () {
                if (this.ws) {
                    //기존에 등록된 이벤트 핸들러 취소
                    this.ws.onOpenCallbacks.length = 0;
                    this.ws.onCloseCallbacks.length = 0;
                    this.ws.onErrorCallbacks.length = 0;
                    //this.unsubscribeAll();
                    this.ws.close();
                }
                var onCloseOrError = _.bind(this.onCloseOrError, this);

                this.open();
                var ws = this.ws;

                // 크롬 버그 방어 코드
                angular.element($window).off('offline.webSocket');
                ws.onOpen(_.bind(this.onOpen, this));
                ws.onError(onCloseOrError);
                ws.onClose(onCloseOrError);
                var self = this;
                ws.onError(function () {
                    $log.error('error', moment().format(), self._reConnectInterval);
                });
                ws.onClose(function () {
                    $log.info('close', moment().format(), self._reConnectInterval);
                });
                ws.onMessage(_.bind(this.onMessage, this), {autoApply: false});
            },
            open: function () {
                var url = HelperConfigUtil.wsUrl() + HelperConfigUtil.orgMemberId(),
                    param = this._param,
                    _url = _.isEmpty(param) ? url : url + '/' + param.projectCode + '/' + param.postNumber;

                // angular-websocket이 일반 ping에서도 $rootScope $digest를 돌아서 scope를 지정해서 방어
                this.ws = $websocket(_url, null);
            },
            onOpen: function () {
                $log.info('open', moment().format(), this._reConnectInterval);
                $interval.cancel(this._reConnectInterval);

                // 크롬 버그 방어 코드
                if (isChrome()) {
                    angular.element($window).on('offline.webSocket', _.bind(function () {
                        $log.info('chrome down', moment().format(), this._reConnectInterval);
                    }, this));
                    angular.element($window).on('offline.webSocket', _.bind(this.onCloseOrError, this));
                }

                if (_.isFunction(this._onOpen)) {
                    this._onOpen();
                }
            },
            onCloseOrError: function () {
                if (closedForceFlag) {
                    closedForceFlag = false;
                    return;
                }

                $interval.cancel(this._reConnectInterval);
                this._reConnectInterval = $interval(_.bind(this.reset, this), RECONNECT_INTERVAL_TIME);
            },
            onMessage: function (message) {
                var data = angular.fromJson(message.data);
                if (_.isEmpty(data)) {
                    return;
                }

                _.forEach(this._subscribeQueue, function (callback) {
                    callback(data);
                });
            },
            destroy: function () {
                closedForceFlag = true;
                this.ws.close();
                $interval.cancel(this._reConnectInterval);
                angular.element($window).off('offline.webSocket');
            },
            //subscribe: function (param) {
            //    //나중에 전체창에서 보기가 지원되면 subscribe 방식으로 변환. 현재는 projectCode와 postNumber가 고정되어 있는 방식으로 웹소켓을 설정함
            //    this.ws.send(angular.toJson(
            //        {
            //            'projectCode': param.projectCode,
            //            'postNumber': param.postNumber
            //        }
            //    ));
            //},
            subscribe: function (callback) {
                this._subscribeQueue.push(callback);
                return this;
            },
            unsubscribeAll: function () {
                this._subscribeQueue.length = 0;
                return this;
            },
            _reConnectInterval: angular.noop
        });

        return {
            createWebSocketInstance: function (param, onOpen) {
                var instance = new WebSocket(param, onOpen);
                $rootScope.$on('$destroy', function () {
                    instance.destroy();
                });
                return instance;
            }
        };
    }

})();
