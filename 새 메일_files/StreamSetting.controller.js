(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .controller('StreamSettingCtrl', StreamSettingCtrl);

    /* @ngInject */
    function StreamSettingCtrl($q, $scope, HelperConfigUtil, HelperFormUtil, Project, StreamSettingBiz, StreamSettingMultiSelectBiz, gettextCatalog) {
        var currentCache = null,
            projects = [];

        $scope.receivedMail = {
            checked: false,
            options: [{
                value: 'all',
                label: gettextCatalog.getString('전체')
            }, {
                value: 'to_cc_me',
                label: gettextCatalog.getString('내가 포함')
            }]
        };

        $scope.serviceUse = HelperConfigUtil.serviceUse();
        $scope.multiSelectMetaData = StreamSettingMultiSelectBiz.multiSelectMetaData;
        $scope.groupedProjects = [];
        $scope.selectedProjects = [];
        $scope.isShowProjectPane = false;
        $scope.projectSelectBtnTitle = gettextCatalog.getString('전체');
        $scope.translation = { search: gettextCatalog.getString('검색') };
        $scope.isCheckedEtcOnly = false;

        $scope.resetDefaultSetting = resetDefaultSetting;
        $scope.onChangeReceivedMailChecked = onChangeReceivedMailChecked;
        $scope.selectProjectItem = selectProjectItem;
        $scope.openProjectPane = openProjectPane;
        $scope.onCloseProjectPane = onCloseProjectPane;
        $scope.submit = submit;
        $scope.cancel = cancel;

        init();

        $scope.$watch('current.alarm', function (newVal, oldVal) {
            // 모두 받기 클릭시의 처리
            if (newVal === 'all' && oldVal) {
                setAlarmToAll($scope.current);
                return;
            }

            // 모두 받기에서 다른 메뉴를 눌렀을 때의 처리
            if (oldVal === 'all' && currentCache) {
                $scope.current = currentCache;
                $scope.current.alarm = newVal;
                var isAllChecked = StreamSettingMultiSelectBiz.isAllChecked($scope.groupedProjects);
                setProjectSelectBtnTitle(isAllChecked);
                currentCache = null;
            }
        });

        // 받은메일 수신 selectpicker가 변경되었을 때의 처리
        $scope.$watch('current.mail.receivedMail', function (newVal) {
            $scope.receivedMail.checked = newVal !== 'none';
        });

        $scope.$watchCollection('selectedProjects', function (newVal) {
            $scope.isCheckedEtcOnly = newVal && newVal.length === 1 && newVal[0].id === 'etc';
        });

        function onChangeReceivedMailChecked() {
            $scope.current.mail.receivedMail = $scope.receivedMail.checked ? 'all' : 'none';
        }

        function submit() {
            if (HelperFormUtil.checkInvaild($scope[$scope.FORM_NAME])) {
                return;
            }

            if ($scope.current.alarm === 'all') {
                currentCache.alarm = 'all';
            }
            $scope.pushTargets.apps.messenger = $scope.pushTargets.apps.project;
            $scope.current.disabledProjectList =  StreamSettingMultiSelectBiz.makeDisabledProjectList($scope.selectedProjects, $scope.groupedProjects);

            $q.all([
                StreamSettingBiz.editStreamFilter($scope.current.alarm === 'all' ? currentCache : $scope.current),
                StreamSettingBiz.editStreamPush($scope.pushTargets)
            ]).then(function () {
                $scope.resultMsg = gettextCatalog.getString("저장되었습니다.");
            });
        }

        function cancel() {
            _reset();
            $scope.resultMsg = gettextCatalog.getString("취소되었습니다.");
        }

        function init() {
            $scope.FORM_NAME = 'streamSetting';
            HelperFormUtil.bindService($scope, $scope.FORM_NAME);

            $q.all([_reset(), Project.fetchMyActiveList()]).then(function (results) {
                projects = results[1].contents();
                setGroupProjects(projects, results[0][0]);
            });

            //$q.all([StreamSettingBiz.fetchStreamFilter(), Project.fetchMyActiveList()]).then(function (results) {
            //    projects = results[1].contents();
            //    setStreamFilter(results[0]);
            //    setGroupProjects(projects, results[0]);
            //});
            //StreamSettingBiz.fetchStreamPush().then(function (data) {
            //    $scope.pushTargets = data;
            //    $scope.pushTargets.apps.project = _.some($scope.pushTargets.apps);
            //});
        }

        function _reset() {
            return $q.all([
                StreamSettingBiz.fetchStreamFilter(),
                StreamSettingBiz.fetchStreamPush()
            ]).then(function (results) {
                setStreamFilter(results[0]);
                $scope.pushTargets = results[1];
                $scope.pushTargets.apps.project = _.some($scope.pushTargets.apps);
                return results;
            });
        }

        // 프로젝트 선택과 관련된 함수들

        function selectProjectItem(project) {
            var isAllChecked;
            if (project.id === 'all') {
                StreamSettingMultiSelectBiz.setAllCheck($scope.groupedProjects, project[$scope.multiSelectMetaData.tickProp]);
                isAllChecked = StreamSettingMultiSelectBiz.isAllChecked($scope.groupedProjects);
                setProjectSelectBtnTitle(isAllChecked);
                return;
            }

            StreamSettingMultiSelectBiz.selectItem(project, $scope.groupedProjects);
            isAllChecked = StreamSettingMultiSelectBiz.isAllChecked($scope.groupedProjects);
            $scope.groupedProjects[0][$scope.multiSelectMetaData.tickProp] = isAllChecked;
            setProjectSelectBtnTitle(isAllChecked);
            StreamSettingMultiSelectBiz.selectItem($scope.groupedProjects[0], $scope.groupedProjects);
        }

        function openProjectPane() {
            $scope.isShowProjectPane = true;
        }

        function onCloseProjectPane() {
            $scope.isShowProjectPane = false;
        }

        function resetDefaultSetting() {
            StreamSettingBiz.fetchDefaultStreamFilterSetting().then(function (data) {
                $scope.current = data;
                setGroupProjects(projects, data);
                currentCache = null;
            });
        }

        function setProjectSelectBtnTitle(isAllChecked) {
            $scope.projectSelectBtnTitle = isAllChecked ? gettextCatalog.getString('전체') : gettextCatalog.getString('선택');
        }

        function setStreamFilter(data) {
            if (data.alarm === 'all') {
                setAlarmToAll(data);
                return;
            }
            $scope.current = data;
        }

        function setGroupProjects(projects, data) {
            var groupedProjects = StreamSettingMultiSelectBiz.groupProjectForMultiSelect(projects, function (project) {
                return !_.includes(data.disabledProjectList, project.id);
            });
            // 전체 추가
            groupedProjects.unshift($scope.multiSelectMetaData.dummyItem(gettextCatalog.getString('전체'), 'all', _.isEmpty(data.disabledProjectList)));
            setProjectSelectBtnTitle(_.isEmpty(data.disabledProjectList));

            // 기타 추가
            groupedProjects.push($scope.multiSelectMetaData.dummyItem(gettextCatalog.getString('기타'), 'etc', !_.includes(data.disabledProjectList, 'etc')));

            $scope.groupedProjects = groupedProjects;
        }

        function setAlarmToAll(data) {
            currentCache = data;
            $scope.current = StreamSettingBiz.getAllSetting();
            $scope.receivedMail.checked = true;
            setProjectSelectBtnTitle(true);
        }
    }

})();
