(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .controller('OrgIpAclCtrl', OrgIpAclCtrl);

    /* @ngInject */
    function OrgIpAclCtrl($q, $scope, $state, PATTERN_REGEX, HelperFormUtil, HelperPromiseUtil, IpAclBiz, MessageModalFactory, OrgEnvironmentService, gettextCatalog, _) {
        var service = $scope.current.service,
            promise = null;

        _init();

        $scope.fetchAclList = fetchAclList;
        $scope.addIpAcl = addIpAcl;
        $scope.removeUpdatingIpAclInput = removeUpdatingIpAclInput;
        $scope.toggleAclMode = toggleAclMode;
        $scope.onDragStart = onDragStart;
        $scope.onMoved = onMoved;
        $scope.removeAcl = removeAcl;
        $scope.updateAcl = updateAcl;

        function _init() {
            $scope.FORM_NAME = 'orgIpAclForm';
            HelperFormUtil.bindService($scope, $scope.FORM_NAME);

            $scope.ALLOW_FILTER_OPTIONS = [{
                name: gettextCatalog.getString('전체'),
                value: 'all'
            }, {
                name: gettextCatalog.getString('허용'),
                value: 'allowed'
            }, {
                name: gettextCatalog.getString('차단'),
                value: 'denied'
            }];
            $scope.PATTERN_REGEX = PATTERN_REGEX;
            $scope.current.allowFilter = 'all';
            $scope.current.addIpAcl = {ipCidr: '', allow: true};
            $scope.current.updateIpAcl = null;
            _.forEach(service.ipAcl, function (acl) {
                acl._updating = false;
            });

            $scope.$watch(function () {
                return _.get($scope.current, 'service.ipAcl.length');
            }, fetchAclList);
        }

        function fetchAclList() {
            $scope.current.filteredAclList = _filterAclList();
        }

        function _filterAclList() {
            if ($scope.current.allowFilter === 'all') {
                return service.ipAcl;
            }
            return _.filter(service.ipAcl, {allow: $scope.current.allowFilter === 'allowed'});
        }

        function _updateIpAcl() {
            if (HelperPromiseUtil.isResourcePending(promise)) {
                return $q.reject();
            }
            var param = OrgEnvironmentService.makeIpAclRequestParam(service);
            promise = IpAclBiz.update($state.params.orgFilter, service.name, param);
            return promise;
        }

        function _confirmAddAcl() {
            if (service.ipAcl.length < 50) {
                return true;
            }
            var msg = gettextCatalog.getString('예외 IP 조건은 최대 50개까지 등록할 수 있습니다.');
            MessageModalFactory.alert(msg, gettextCatalog.getString('예외 IP 추가'));
            return false;
        }

        function addIpAcl() {
            if (!$scope.current.addIpAcl.ipCidr || $scope.hasError('addIpCidr') || !_confirmAddAcl()) {
                return;
            }

            service.ipAcl.push(_.cloneDeep($scope.current.addIpAcl));
            _updateIpAcl().then(function () {
                $scope.current.addIpAcl.ipCidr = '';
                $scope.current.addIpAcl.allow = true;
            }, function () {
                service.ipAcl.splice(service.ipAcl.length - 1, 1);
            });
        }

        function removeUpdatingIpAclInput() {
            $scope.current.updateIpAcl.ipCidr = '';
        }

        function toggleAclMode(acl) {
            acl._updating = !acl._updating;
            if (acl._updating && $scope.current.updateIpAcl) {
                _.forEach($scope.current.filteredAclList, function (_acl) {
                    _acl._updating = false;
                });
                acl._updating = true;
            }
            $scope.current.updateIpAcl = acl._updating ? _.cloneDeep(acl) : null;
        }

        function _setMovedItemPosition(movedItem, movingItem) {
            if (!movedItem) {
                return;
            }
            _.remove(service.ipAcl, movingItem);

            var index = _.findIndex($scope.current.filteredAclList, movedItem) + 1;
            if (index === $scope.current.filteredAclList.length) {
                service.ipAcl.push(movedItem);
            } else {
                service.ipAcl.splice(_.findIndex(service.ipAcl, $scope.current.filteredAclList[index]), 0, [movedItem]);
            }
        }

        var ipAclDump;

        function onDragStart() {
            ipAclDump = _.cloneDeep(service.ipAcl);
        }

        function onMoved(index) {
            var movedItem = _.difference($scope.current.filteredAclList, service.ipAcl)[0],
                movingItem = $scope.current.filteredAclList[index];
            _setMovedItemPosition(movedItem, movingItem);
            $scope.current.filteredAclList.splice(index, 1);
            _updateIpAcl().catch(function () {
                service.ipAcl = ipAclDump;
                fetchAclList();
            });
        }

        function _confirmRemoveAcl() {
            var msg = gettextCatalog.getString('<p>등록된 IP는 삭제 후, 복구되지 않습니다.</p><p>삭제하시겠습니까?</p>');
            return MessageModalFactory.confirm(msg, gettextCatalog.getString('에러 IP 삭제')).result;
        }

        function removeAcl(acl) {
            _confirmRemoveAcl().then(function () {
                var index = service.ipAcl.indexOf(acl);
                service.ipAcl.splice(index, 1);
                _updateIpAcl().catch(function () {
                    service.ipAcl.splice(index, 0, acl);
                });
            });
        }

        function updateAcl(acl) {
            if (!$scope.current.updateIpAcl.ipCidr || HelperFormUtil.checkInvaild($scope[$scope.FORM_NAME])) {
                return;
            }
            var backupAcl = _.cloneDeep(acl);
            _.assign(acl, $scope.current.updateIpAcl);
            acl._updating = false;
            _updateIpAcl().then(function () {
                $scope.current.updateIpAcl = null;
            }, function () {
                _.assign(acl, backupAcl);
            });
        }
    }

})();
