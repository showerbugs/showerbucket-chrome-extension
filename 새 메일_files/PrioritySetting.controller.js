(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .controller('PrioritySettingCtrl', PrioritySettingCtrl);

    /* @ngInject */
    function PrioritySettingCtrl($scope, HelperFormUtil, PriorityRepository, PriorityUtil, _) {
        var $ctrl = this;

        $ctrl.PriorityUtil = PriorityUtil;
        $ctrl.submit = submit;

        _init();

        $scope.$watch('shared.projectCode', function (newVal) {
            if (newVal) {
                _fetchPriorityList(newVal);
            }
        });

        function submit() {
            var body = {};
            _.forEach($ctrl.priorityList, function (priority) {
                body[priority.code] = priority.description;
            });
            PriorityRepository.update($scope.shared.projectCode, body).then(function() {
                _fetchPriorityList($scope.shared.projectCode);
            });
        }
        
        function _init() {
            HelperFormUtil.bindService($scope, 'priorityForm');

            $ctrl.priorityList = [{
                code: 'highest',
                description: ''
            }, {
                code: 'high',
                description: ''
            }, {
                code: 'normal',
                description: ''
            }, {
                code: 'low',
                description: ''
            }, {
                code: 'lowest',
                description: ''
            }];
        }

        function _fetchPriorityList(projectCode) {
            PriorityRepository.fetchAndCache({projectCode: projectCode}).then(function () {
                _setDescriptions();
            });
        }

        function _setDescriptions() {
            var priorityMap = PriorityRepository.getModel().value;
            _.forEach($ctrl.priorityList, function (prioritySetting) {
                prioritySetting.description = priorityMap[prioritySetting.code];
            });
        }
    }

})();
