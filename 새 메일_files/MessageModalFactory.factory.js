(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .factory('MessageModalFactory', MessageModalFactory)
        .controller('MessageModalFactoryCtrl', MessageModalFactoryCtrl);

    /* @ngInject */
    function MessageModalFactory($uibModal, gettextCatalog, _) {
        var TEMPLATE_PREFIX = 'modules/share/services/MessageModalFactory/ui-templates/';

        function createMessageModalInstance(message, title, modalOptions, resolveOptions) {
            resolveOptions = _.assign({
                focusToCancel: false,
                confirmBtnLabel: gettextCatalog.getString('확인'),
                optionBtnLabel: '',
                confirmBtnClick: angular.noop,
                cancelBtnLabel: gettextCatalog.getString('취소'),
                cancelBtnClick: angular.noop
            }, resolveOptions);
            return $uibModal.open(angular.extend({
                'controller': 'MessageModalFactoryCtrl',
                'windowClass': 'message-modal',
                'backdrop': 'static', /*  this prevent user interaction with the background  */
                //'backdropClass': 'none-backdrop',
                'resolve': {
                    'message': function () {
                        return message;
                    },
                    'title': function () {
                        return title;
                    },
                    'options': function () {
                        return resolveOptions;
                    }
                }
            }, modalOptions));
        }

        var confirmModalInstance, alertModalInstance, plainModalInstance, templateModalInstance;
        return {
            // options: {focusToCancel: true, confirmBtnLabel: '삭제'}
            confirm: function (message, title, options, modalOptions) {
                if (confirmModalInstance) {
                    return confirmModalInstance;
                }

                confirmModalInstance = createMessageModalInstance(message, title, angular.extend({
                    'templateUrl': TEMPLATE_PREFIX + ((options && options.optionBtnLabel) ? 'message_modal.confirm_with_option.html' : 'message_modal.confirm.html')
                }, modalOptions), options);
                confirmModalInstance.result.finally(function () {
                    confirmModalInstance = null;
                });
                return confirmModalInstance;
            },
            alert: function (message, title, options, modalOptions) {
                if (alertModalInstance) {
                    return alertModalInstance;
                }

                alertModalInstance = createMessageModalInstance(message, title, angular.extend({
                    'templateUrl': TEMPLATE_PREFIX + 'message_modal.alert.html'
                }, modalOptions), options);
                alertModalInstance.result.finally(function () {
                    alertModalInstance = null;
                });
                return alertModalInstance;
            },
            plain: function (message, title, options, modalOptions) {
                if (plainModalInstance) {
                    return plainModalInstance;
                }

                plainModalInstance = createMessageModalInstance(message, title,  angular.extend({
                    'templateUrl': TEMPLATE_PREFIX + 'message_modal.plain.html'
                }, modalOptions), options);
                plainModalInstance.result.finally(function () {
                    plainModalInstance = null;
                });
                return plainModalInstance;
            },
            template: function (message, title, templateUrl, options) {
                if (templateModalInstance) {
                    return templateModalInstance;
                }

                templateModalInstance = createMessageModalInstance(message, title, {
                    'templateUrl': templateUrl
                }, options);
                templateModalInstance.result.finally(function () {
                    templateModalInstance = null;
                });
                return templateModalInstance;
            }
        };
    }

    /* @ngInject */
    function MessageModalFactoryCtrl($scope, $uibModalInstance, message, options, title) {
        $scope.message = message;
        $scope.title = title;
        $scope.focusToCancel = options.focusToCancel;
        $scope.confirmBtnLabel = options.confirmBtnLabel;
        $scope.cancelBtnLabel = options.cancelBtnLabel;
        $scope.optionBtnLabel = options.optionBtnLabel;

        $scope.confirmBtnClick = function (reason) {
            options.confirmBtnClick(reason);
            $scope.ok(reason);
        };

        $scope.cancelBtnClick = function () {
            options.cancelBtnClick();
            $scope.cancel();
        };

        $scope.ok = function (reason) {
            $uibModalInstance.close(reason);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

})();
