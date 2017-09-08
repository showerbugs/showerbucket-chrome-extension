(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('projectHeaderSearch', {
            templateUrl: 'modules/project/header/projectHeaderSearch/projectHeaderSearch.html',
            controller: ProjectHeaderSearch
        });

    /* @ngInject */
    function ProjectHeaderSearch($element, $scope, $state, $timeout, KEYS, PATTERN_REGEX, PROJECT_STATE_NAMES, ApiPageSizeFactory, DigestService, SearchFormShare, SearchParamConvertUtil, gettextCatalog, _) {
        var codeLabelMap = {
            all: gettextCatalog.getString('전체'),
            subject: gettextCatalog.getString('제목'),
            content: gettextCatalog.getString('본문'),
            fromUserName: gettextCatalog.getString('보낸 사람'),
            toUserName: gettextCatalog.getString('받는 사람'),
            ccUserName: gettextCatalog.getString('참조자'),
            comment: gettextCatalog.getString('댓글')/*,
             fileName: gettextCatalog.getString('파일')*/
        }, codeList = ['all', 'subject', 'content', 'fromUserName', 'toUserName', 'ccUserName', 'comment'/*, 'fileName'*/];

        var $ctrl = this,
            index = 0,
            searchBox$ = null,
            tagBox$ = null,
            input$ = null;

        var _debounceKeydownInput = _.debounce(_onKeydownInput, 50);

        $ctrl.searchForm = SearchFormShare;
        $ctrl.getSearchFieldList = getSearchFieldList;
        $ctrl.searchWithParam = searchWithParam;
        $ctrl.searchForm.doSearch = doSearch;
        $ctrl.resetModels = resetModels;

        _init();

        $ctrl.$onInit = function () {
            _onStateChangeSuccess();
            $scope.$on('$stateChangeSuccess', _onStateChangeSuccess);
        };

        function getSearchFieldList(keyword) {
            $ctrl.searchForm.searchFieldList = keyword ? _.map(codeList, _makeField) : [];
            DigestService.safeLocalDigest($scope);
        }

        function searchWithParam(fieldItem, model, keyword) {
            // 값이 있어야 검색합니다.
            if (!keyword) {
                $ctrl.searchForm.searchResultModel.length -= 1;
                return;
            }

            _.set(model, 'keyword', keyword);
            $ctrl.searchForm.doSearch();
        }

        function doSearch() {
            if ($ctrl.searchForm.searchResultModel.length === 0) {
                return;
            }

            var searchParam = {query: SearchParamConvertUtil.toString($ctrl.searchForm.searchResultModel)};
            searchParam.scope = $ctrl.searchForm.searchScope;
            //default
            searchParam.page = 1;
            searchParam.size = ApiPageSizeFactory.getListApiSize();
            searchParam.order = 'createdAt';
            $state.go(PROJECT_STATE_NAMES.SEARCH_BOX, searchParam, {reload: PROJECT_STATE_NAMES.SEARCH_BOX, inherit: false});
        }

        function resetModels() {
            $ctrl.searchForm.searchResultModel.length = 0;
        }

        function _onStateChangeSuccess() {
            if (!$state.includes(PROJECT_STATE_NAMES.SEARCH_BOX)) {
                $ctrl.searchForm.searchResultModel.length = 0;
                $ctrl.searchFocus = false;
            } else {
                _setHorizontalPosition();
            }
            $ctrl.searchForm.setSearchScope($state.params.scope);
            _setProjectSearch();
        }

        function _makeField(code) {
            return {label: codeLabelMap[code], code: code, id: index++};
        }

        function _setHorizontalPosition() {
            $timeout(function () {
                if (!searchBox$ || !tagBox$) {
                    searchBox$ = $element.find('.select2-choices');
                    tagBox$ = $element.find('.ui-select-match');
                }

                searchBox$.scrollLeft(tagBox$.width() - 360);
            }, 100, false);
        }

        function _onKeydownInput(event) {
            var key = event.which;
            if (key === KEYS.UP || key === KEYS.DOWN) {
                _setHorizontalPosition();
                return;
            }

            if (key !== KEYS.LEFT && key !== KEYS.RIGHT) {
                return;
            }

            var selected$ = $element.find('.tag-badge.select').parent();

            if (key === KEYS.LEFT && !selected$.is(':first-of-type')) {
                selected$ = selected$.prev();
            } else if (key === KEYS.RIGHT && !selected$.is(':last-of-type')) {
                selected$ = selected$.after();
            } else if (key === KEYS.RIGHT && input$.is(':focus')) {
                _setHorizontalPosition();
            }

            if (!_.isEmpty(selected$)) {
                selected$[0].scrollIntoView();
            }
        }

        function _setProjectSearch() {
            $timeout(function () {
                var projectCode = $state.params.projectCodeFilter || _.get(PATTERN_REGEX.projectCodeInSearchParam.exec($state.params.query), '[1]');

                // projectCode 부분을 지움
                if (_.get($ctrl.searchForm.searchResultModel, '[0].code') === 'projectCode') {
                    $ctrl.searchForm.searchResultModel.splice(0, 1);
                }

                // projectCode 부분을 채움
                if (projectCode) {
                    $ctrl.searchForm.searchResultModel.unshift({code: 'projectCode', keyword: projectCode});
                }
                DigestService.safeLocalDigest($scope);
            }, 0, false);
        }

        function _init() {
            $ctrl.getSearchFieldList();
            if ($state.includes(PROJECT_STATE_NAMES.SEARCH_BOX)) {
                $ctrl.searchForm.initialize(codeLabelMap);
                $ctrl.searchFocus = true;
            }

            _setProjectSearch();
            $timeout(function () {
                input$ = $element.find('input.ui-select-search');
                input$.on('keydown', _debounceKeydownInput);

                $scope.$on('$destroy', function () {
                    input$.off('keydown');
                });
            }, 0, false);
        }

    }

})();
