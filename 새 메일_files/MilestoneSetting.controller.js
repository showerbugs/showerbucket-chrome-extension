(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .controller('MilestoneSettingCtrl', MilestoneSettingCtrl)
        .controller('MilestoneCreateCtrl', MilestoneCreateCtrl);

    /* @ngInject */
    function MilestoneSettingCtrl ($scope, $uibModal, MessageModalFactory, MilestoneBiz, RootScopeEventBindHelper, gettextCatalog, _) {
        var allMilestones = [];
        $scope.ui = {
            milestones: [],
            count: {
                open: 0,
                closed: 0
            },
            status: 'open',
            STATUS_NAMES: {
                OPEN: 'open',
                CLOSED: 'closed'
            }
        };


        $scope.openMilestoneCreateModal = function () {
            return $uibModal.open({
                'templateUrl': 'modules/setting/common/project/milestone/milestoneCreateOrUpdate.html',
                'windowClass': 'setting-modal project-management dooray-setting-content',
                'backdrop': 'static', /*  this prevent user interaction with the background  */
                'controller': MilestoneCreateCtrl,
                'resolve': {
                    'projectCode': function () {
                        return $scope.shared.projectCode;
                    },
                    'targetMileStone': function () {
                        return;
                    },
                    'allMilestones': function () {
                        return allMilestones;
                    }
                }
            });
        };

        $scope.openMilestoneEditModal = function (milestone) {
            return $uibModal.open({
                'templateUrl': 'modules/setting/common/project/milestone/milestoneCreateOrUpdate.html',
                'windowClass': 'setting-modal project-management dooray-setting-content',
                'backdrop': 'static', /*  this prevent user interaction with the background  */
                'controller': MilestoneCreateCtrl,
                'resolve': {
                    'projectCode': function () {
                        return $scope.shared.projectCode;
                    },
                    'targetMileStone': function () {
                        return milestone;
                    },
                    'allMilestones': function () {
                        return allMilestones;
                    }
                }
            });
        };

        $scope.removeMilestone = function (milestone) {
            MessageModalFactory.confirm(gettextCatalog.getString('마일스톤을 삭제하면 다시 복구할 수 없습니다. <br>삭제하시겠습니까?'), gettextCatalog.getString('마일스톤 삭제'), {confirmBtnLabel: gettextCatalog.getString('삭제')}).result.then(function () {
                MilestoneBiz.removeMilestone($scope.shared.projectCode, milestone.id, {force: true}).then(function () {
                    _.remove($scope.ui.milestones, milestone);
                });
            });
        };

        var getReverseStatus = function () {
            return $scope.ui.status === $scope.ui.STATUS_NAMES.OPEN ?
                $scope.ui.STATUS_NAMES.CLOSED :
                $scope.ui.STATUS_NAMES.OPEN;
        };

        $scope.changeStatusMilestone = function (milestone) {
            var reverseStatus = getReverseStatus();
            MilestoneBiz.updateMilestone($scope.shared.projectCode, milestone, {status: reverseStatus});
        };

        $scope.changeMilestonesInStatus = function (status) {
            $scope.ui.status = status;
            fetchMilestones();
        };

        var fetchMilestones = function () {
            MilestoneBiz.getMilestones($scope.shared.projectCode).then(function (result) {
                allMilestones = result.contents();
                _.forEach(allMilestones, function (milestone) {
                    milestone.counts.postCount.workflow._all = _.reduce(milestone.counts.postCount.workflow, function (total, value) {
                        return total + value;
                    });
                });
                $scope.ui.milestones = _.filter(allMilestones, {'status': $scope.ui.status});
                $scope.ui.count.open = $scope.ui.status === $scope.ui.STATUS_NAMES.OPEN ? $scope.ui.milestones.length : (allMilestones.length - $scope.ui.milestones.length);
                $scope.ui.count.closed = allMilestones.length - $scope.ui.count.open;
            });
        };

        RootScopeEventBindHelper.withScope($scope).on(MilestoneBiz.EVENTS.RESETCACHE, fetchMilestones);

        fetchMilestones();
    }

    /* @ngInject */
    function MilestoneCreateCtrl ($scope, $q, $uibModalInstance, PATTERN_REGEX, REPLACE_REGEX, DateConvertUtil, HelperPromiseUtil, MessageModalFactory, MilestoneBiz, HelperFormUtil, CheckDuplicatedUtil, allMilestones, gettextCatalog, moment, projectCode, targetMileStone, _){

        $scope.REPLACE_REGEX = REPLACE_REGEX;
        $scope.PATTERN_REGEX = PATTERN_REGEX;
        $scope.FORM_NAME = 'milestoneCreateForm';

        $scope.ui = {
            milestones: [],
            mode: null,
            hasDuration: true,
            status: 'open',
            MODE_NAMES: {
                EDIT: 'edit',
                CREATE: 'create'
            }
        };
        var promise = null,
            firstHasDuration = true,
            cache = {
                startedAt: null,
                endedAt: null
            };

        function init() {
            $scope.ui.mode = targetMileStone ? $scope.ui.MODE_NAMES.EDIT : $scope.ui.MODE_NAMES.CREATE;
            HelperFormUtil.bindService($scope, $scope.FORM_NAME);

            if(targetMileStone) {
                $scope.ui.hasDuration = !!targetMileStone.startedAt;
                $scope.milestone = {
                    name: targetMileStone.name,
                    startedAt: targetMileStone.startedAt,
                    endedAt: targetMileStone.endedAt
                };
            } else {
                $scope.milestone = {};
                setDefaultDuration();
            }
            cache.startedAt = $scope.milestone.startedAt;
            cache.endedAt = $scope.milestone.endedAt;
            firstHasDuration = $scope.ui.hasDuration;
        }

        function setDefaultDuration() {
            var defaultStartedAt = MilestoneBiz.makeDefaultStartedAt(allMilestones);
            $scope.milestone.startedAt = DateConvertUtil.makeDefaultIso8601String(defaultStartedAt);
            $scope.milestone.endedAt = DateConvertUtil.makeDefaultIso8601String(defaultStartedAt.add(6, 'day'));
        }

        var makeCreateParams = function () {
            var milestone = $scope.milestone;
            return {
                name: milestone.name,
                startedAt: $scope.ui.hasDuration ? moment(milestone.startedAt).startOf('day').format(): null,
                endedAt: $scope.ui.hasDuration ? moment(milestone.endedAt).endOf('day').format() : null
            };
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };

        $scope.submit = function () {
            if (HelperPromiseUtil.isResourcePending(promise) || HelperFormUtil.checkInvaild($scope[$scope.FORM_NAME]) || !isValidDate()) {
                return;
            }

            var target = $scope.ui.mode !== 'edit' ? createMilestone : editMilestone;
            promise = target();
        };

        var createMilestone = function () {
            var params = makeCreateParams();
            return MilestoneBiz.addMilestone(projectCode, params).then(function () {
                $scope.cancel();
            });
        };

        var editMilestone = function () {
            if (_.get($scope.milestone, 'name') === _.get(targetMileStone, 'name') &&
                _.get($scope.milestone, 'startedAt') === _.get(targetMileStone, 'startedAt') &&
                _.get($scope.milestone, 'endedAt') === _.get(targetMileStone, 'endedAt') &&
                firstHasDuration === $scope.ui.hasDuration) {
                $scope.cancel();
                return $q.when();
            }

            var params = makeCreateParams();
            return MilestoneBiz.updateMilestone(projectCode, targetMileStone, params).then(function () {
                $scope.cancel();
            });
        };

        $scope.checkDuplicatedName = function (name) {
            if ($scope.ui.mode === $scope.ui.MODE_NAMES.EDIT &&
                _.get(targetMileStone, 'name') === name) {
                return $q.when(true);
            }
            return $q.when(!CheckDuplicatedUtil.byString(allMilestones, 'name', name));
        };

        init();

        var isValidDate = function () {
            var startedAt = moment($scope.milestone.startedAt),
                endedAt = moment($scope.milestone.endedAt);

            if (startedAt.isAfter(endedAt)) {
                MessageModalFactory.alert(gettextCatalog.getString('시작일은 종료일 이전으로 입력해 주세요.'));
                $scope.milestone.endedAt = DateConvertUtil.makeDefaultIso8601String(startedAt.add(6, 'day'));
                return false;
            }
            return true;
        };

        $scope.onChangeHasDuration = function () {
            if ($scope.ui.hasDuration && !$scope.milestone.startedAt) {
                setDefaultDuration();
            }
        };

        $scope.onChangeDate = function (property) {
            if ($scope.milestone[property] && moment($scope.milestone[property]).isValid()) {
                cache[property] = $scope.milestone[property];
            } else {
                $scope.milestone[property] = cache[property];
            }
        };
    }


})();
