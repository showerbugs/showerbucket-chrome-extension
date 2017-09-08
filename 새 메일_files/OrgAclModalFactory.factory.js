(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .factory('OrgAclModalFactory', OrgAclModalFactory)
        .controller('OrgAclModalCtrl', OrgAclModalCtrl);

    /* @ngInject */
    function OrgAclModalFactory($uibModal) {
        return {
            open: function (service, activeTab) {
                return $uibModal.open({
                    'templateUrl': 'modules/setting/admin/svr/environment/OrgAclModalFactory/orgAclModal.html',
                    'backdrop': 'static', /*  this prevent user interaction with the background  */
                    'windowClass': 'setting-modal dooray-setting-content org-acl-modal',
                    'controller': 'OrgAclModalCtrl',
                    'resolve': {
                        service: function () {
                            return service;
                        },
                        activeTab: function () {
                            return activeTab;
                        }
                    }
                });
            }
        };
    }

    /* @ngInject */
    function OrgAclModalCtrl($scope, $state, $uibModalInstance, IpAclBiz, OrgEnvironmentService, activeTab, service, _) {
        _init();

        $scope.changeTab = changeTab;
        $scope.updateAllAcl = updateAllAcl;
        $scope.close = close;

        function _init() {
            $scope.TABS = OrgEnvironmentService.MODAL_TAB_KEYS;
            $scope.ORG_ACL_OPTIONS = OrgEnvironmentService.ORG_ACL_OPTIONS;

            var invertServiceKeys = _.invert(OrgEnvironmentService.SERVICE_KEYS);
            var groupName = _.find(OrgEnvironmentService.SERVICE_GROUP_MAP, function (value, key) {
                return _.startsWith(invertServiceKeys[service.name], key);
            });
            if (activeTab === $scope.TABS.MEMBER) {
                $scope.activeTabIndex = 1;
            }

            $scope.current = {
                service: service,
                serviceName: groupName + ' > ' + OrgEnvironmentService.SERVICE_NAMES[service.name],
                tab: activeTab || $scope.TABS.IP,
                defaultAcl: service._getOrSetProp('defaultAcl')
            };
        }

        function updateAllAcl() {
            service._getOrSetProp('defaultAcl', $scope.current.defaultAcl);
            var param = OrgEnvironmentService.makeIpAclRequestParam(service);
            return IpAclBiz.update($state.params.orgFilter, service.name, param);
        }

        function changeTab(tabKey) {
            $scope.current.tab = tabKey;
        }

        function close() {
            $uibModalInstance.dismiss();
        }
    }

})();
