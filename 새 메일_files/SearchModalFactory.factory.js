(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('SearchModalFactory', SearchModalFactory)
        .controller('SearchModalCtrl', SearchModalCtrl);

    /* @ngInject */
    function SearchModalFactory($uibModal, SearchModalActionFactory) {
        var modalInstance;

        return {
            open: function (action, selectedTask) {
                if (modalInstance) {
                    return;
                }

                modalInstance = $uibModal.open({
                    'templateUrl': SearchModalActionFactory[action].templateUrl,
                    'controller': 'SearchModalCtrl',
                    'windowClass': 'setting-modal search-modal',
                    'backdropClass': 'none-backdrop',
                    'resolve': {
                        action: function () {
                            return action;
                        },
                        selectedTask: function () {
                            return selectedTask;
                        }
                    }
                });

                modalInstance.result.finally(function () {
                    modalInstance = null;
                });

                return modalInstance;

            }
        };
    }

    /* @ngInject */
    function SearchModalCtrl($uibModalInstance, $scope, HelperPromiseUtil, action, selectedTask, SearchModalActionFactory, _) {
        var promise = null;
        $scope.eventHandler = {
            click: function (task) {
                if (HelperPromiseUtil.isResourcePending(promise)) {
                    return;
                }
                promise = $scope.selectedActionMap.select(task).finally(function () {
                    $scope.ok();
                });
            }
        };

        var taskList = {
            search: function (keyword) {
                keyword = angular.isString(keyword) ? keyword.trim() : '';
                if (!keyword) {
                    return this.init();
                }

                $scope.loading = true;
                $scope.selectedActionMap.search(keyword).then(function (results) {
                    if (_.isUndefined(keyword) || $scope.word === keyword) {
                        $scope.searchResultGroups = results;
                        $scope.loading = false;
                    }
                });
            },
            init: function () {
                $scope.loading = true;
                $scope.selectedActionMap.init(selectedTask).then(function (results) {
                    $scope.searchResultGroups = results;
                    $scope.loading = false;
                });
            }
        };

        $scope.$watch('word', function (newVal, oldVal) {
            if (_.isEqual(newVal, oldVal)) {
                return;
            }

            if (newVal && newVal.trim()) {
                taskList.search(newVal);
            } else {
                taskList.init();
            }
        });

        $scope.ok = function () {
            $uibModalInstance.close('success');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        var init = function () {
            $scope.selectedActionMap = SearchModalActionFactory[action];
            taskList.init();
        };

        init();
    }

})();
