(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('SharedLinkSettingModalFactory', SharedLinkSettingModalFactory)
        .controller('SharedLinkSettingModalCtrl', SharedLinkSettingModalCtrl)
        .controller('SharedLinkCreateModalCtrl', SharedLinkCreateModalCtrl);

    /* @ngInject */
    function SharedLinkSettingModalFactory($uibModal, $q) {

        return {
            open: function (projectCode, postNumber, postCreatedAt, fromMemberId) {
                return $q.when($uibModal.open({
                    templateUrl: 'modules/project/setting/sharedLinkSetting/sharedLinkSettingModal.html',
                    controller: 'SharedLinkSettingModalCtrl',
                    windowClass: 'setting-modal dooray-setting-content',
                    resolve: {
                        projectCode: function () {
                            return projectCode;
                        },
                        postNumber: function () {
                            return postNumber;
                        },
                        postCreatedAt: function () {
                            return postCreatedAt;
                        },
                        fromMemberId: function () {
                            return fromMemberId;
                        }
                    }
                }));
            },
            create: function (projectCode, postNumber, postCreatedAt) {
                return $q.when($uibModal.open({
                    templateUrl: 'modules/project/setting/sharedLinkSetting/sharedLinkCreateModal.html',
                    controller: 'SharedLinkCreateModalCtrl',
                    windowClass: 'setting-modal dooray-setting-content',
                    resolve: {
                        projectCode: function () {
                            return projectCode;
                        },
                        postNumber: function () {
                            return postNumber;
                        },
                        link: function () {
                            return;
                        },
                        postCreatedAt: function () {
                            return postCreatedAt;
                        }
                    }
                }));
            },
            edit: function (link) {
                return $q.when($uibModal.open({
                    templateUrl: 'modules/project/setting/sharedLinkSetting/sharedLinkCreateModal.html',
                    controller: 'SharedLinkCreateModalCtrl',
                    windowClass: 'setting-modal dooray-setting-content',
                    resolve: {
                        link: function () {
                            return link;
                        },
                        projectCode: function () {
                            return;
                        },
                        postNumber: function () {
                            return;
                        },
                        postCreatedAt: function () {
                            return;
                        }
                    }
                }));
            }
        };
    }


    /* @ngInject */
    function SharedLinkSettingModalCtrl($uibModalInstance, $scope, fromMemberId, postCreatedAt, postNumber, projectCode) {
        $scope.projectCode = projectCode;
        $scope.postNumber = postNumber;
        $scope.postCreatedAt = postCreatedAt;
        $scope.fromMemberId = fromMemberId;

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    /* @ngInject */
    function SharedLinkCreateModalCtrl($uibModalInstance, $scope, HelperPromiseUtil, MessageModalFactory, SharedLinkBiz, gettextCatalog, link, moment, postCreatedAt, postNumber, projectCode, _) {
        $scope.today = moment().format();
        var promise = null;

        _init();

        $scope.ok = ok;
        $scope.cancel = cancel;

        function _init() {
            $scope.ui = {
                MODE_NAMES: {
                    EDIT: 'edit',
                    CREATE: 'create'
                }
            };
            $scope.shared = {
                parts: {}
            };

            if(link) {
                $scope.shared.expiredAt = link.expiredAt;
                $scope.shared.projectCode = link.project.code;
                $scope.shared.postNumber = link.post.number;
                $scope.shared.postCreatedAt = link.post.createdAt;
                $scope.ui.mode = $scope.ui.MODE_NAMES.EDIT;
                _.forEach(link.parts, function(value) {
                    $scope.shared.parts[value] = true;
                });
            } else {
                $scope.shared.expiredAt = _getDefaultExpiredDate();
                $scope.shared.projectCode = projectCode;
                $scope.shared.postNumber = postNumber;
                $scope.shared.postCreatedAt = postCreatedAt;
                $scope.ui.mode = $scope.ui.MODE_NAMES.CREATE;
                $scope.shared.parts.post = true;
            }

            var momentPostCreatedAt = moment($scope.shared.postCreatedAt);

            $scope.$watch('shared.expiredAt', function (newVal, oldVal) {
                if (newVal && moment(newVal).endOf('day').isBefore(momentPostCreatedAt)) {
                    MessageModalFactory.alert(gettextCatalog.getString('생성일 이전 날짜는 선택할 수 없습니다.')).result.finally(function () {
                        $scope.shared.expiredAt = oldVal;
                    });
                }
            });
        }

        function _getDefaultExpiredDate() {
            return moment().add(1, 'months');
        }

        function ok() {
            if (HelperPromiseUtil.isResourcePending(promise)) {
                return;
            }

            var param = {
                projectCode: $scope.shared.projectCode,
                postNumber: $scope.shared.postNumber
            },  requestBody = {
                parts: _($scope.shared.parts).pickBy(_.isTrue).keys().value(),
                expiredAt: moment($scope.shared.expiredAt).endOf('day').format()
            };

            if ($scope.ui.mode === $scope.ui.MODE_NAMES.EDIT) {
                promise = SharedLinkBiz.update(_.assign(param, {sharedLinkId: link.id}), requestBody).then(function(){
                    $uibModalInstance.close(link.id);
                });
            } else {
                promise = SharedLinkBiz.add(param, requestBody).then(function(result){
                    $uibModalInstance.close(result.contents().id);
                });
            }
        }

        function cancel() {
            $uibModalInstance.dismiss('cancel');
        }

    }





})();
