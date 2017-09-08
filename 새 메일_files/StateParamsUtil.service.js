(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .service('StateParamsUtil', StateParamsUtil);

    /* @ngInject */
    function StateParamsUtil($state, HelperConfigUtil, SearchParamConvertUtil) {
        var orgMemberId = HelperConfigUtil.orgMemberId(),
            _listStatus = null;// history back을 위한 방어코드 https://nhnent.dooray.com/project/projects/dooray-프로젝트/4013

        return {
            getProjectCodeFilter: getProjectCodeFilter,
            getFilterUniqueKey: getFilterUniqueKey,
            getListStatus: getListStatus,
            setListStatus: setListStatus,
            changeParamWithoutReload: changeParamWithoutReload
        };

        function getProjectCodeFilter(params) {
            var stateParams = params || ($state.params.query ? SearchParamConvertUtil.toParam($state.params.query) : $state.params);
            return stateParams.projectCodeFilter || stateParams.projectCode;
        }

        function getFilterUniqueKey(appendKey) {
            var name = $state.current.name.replace('.view', '');
            var additionalKey = ($state.current.name.indexOf('projects')) > -1 ? '.' + getProjectCodeFilter() : '';
            additionalKey += appendKey || '';
            return [name + additionalKey, orgMemberId].join('.');
        }

        function getListStatus() {
            return _listStatus;
        }

        function setListStatus(listStatus) {
            _listStatus = listStatus;
        }

        function changeParamWithoutReload(param) {
            $state.go('.', param, {reload: false, notify: false});
        }
    }

})();
