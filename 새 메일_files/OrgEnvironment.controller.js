(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .controller('OrgEnvironmentCtrl', OrgEnvironmentCtrl);

    /* @ngInject */
    function OrgEnvironmentCtrl($scope, $state, IpAclBiz, OrgAclModalFactory, OrgEnvironmentService, ServiceBiz, moment, _) {
        var serviceNameList = [];

        _init();

        $scope.updateAclSetting = updateAclSetting;
        $scope.updateUseService = updateUseService;
        $scope.updateDefaultAcl = updateDefaultAcl;

        function _init() {
            serviceNameList = OrgEnvironmentService.getServiceList();
            $scope.SERVICE_GROUP = OrgEnvironmentService.getServiceGroupInfo();
            $scope.SERVICE_KEYS = OrgEnvironmentService.SERVICE_KEYS;
            $scope.SERVICE_NAMES = OrgEnvironmentService.SERVICE_NAMES;
            $scope.ORG_ACL_OPTIONS = OrgEnvironmentService.ORG_ACL_OPTIONS;
            $scope.MODAL_TAB_KEYS = OrgEnvironmentService.MODAL_TAB_KEYS;

            $scope.current = {};
            _fetch();
        }

        function updateAclSetting(service, tabKey) {
            OrgAclModalFactory.open(service, tabKey).result.finally(function () {
                _fetch();
            });
        }

        function updateUseService(service) {
            var param = {
                use: service.use,
                option: service.option
            };
            ServiceBiz.update($state.params.orgFilter, service.name, param);
        }

        function updateDefaultAcl(service) {
            var param = OrgEnvironmentService.makeIpAclRequestParam(service);
            IpAclBiz.update($state.params.orgFilter, service.name, param);
        }

        function _fetch() {
            ServiceBiz.fetchList($state.params.orgFilter).then(function (result) {
                var data = {fetchedAt: moment().format()};
                $scope.serviceList = _.map(serviceNameList, function (serviceName) {
                    var service = _.find(result.contents(), {name: serviceName});
                    OrgEnvironmentService.setInitialValue(service);
                    data[service.name] = service;
                    return service;
                });
                _.assign($scope.current, data);
                $scope.refreshScroll();
            });
        }
    }

})();
