(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailHeaderSearch', {
            templateUrl: 'modules/mail/header/mailHeaderSearch/mailHeaderSearch.html',
            controller: MailHeaderSearch
        });

    /* @ngInject */
    function MailHeaderSearch($scope, $state, $timeout,
                              DigestService,
                              MAIL_STATE_NAMES,
                              MailSearchUtil,
                              MailSearchFormRepository, MailSearchResultRepository,
                              _) {
        var $ctrl = this;

        $ctrl.searchFieldList = [];
        $ctrl.searchInputFocus = false;

        $ctrl.tagModels = tagModels;
        $ctrl.resetModels = resetModels;
        $ctrl.onChangeKeyword = onChangeKeyword;
        $ctrl.searchWithStateChange = searchWithStateChange;
        $ctrl.focusSearchInput = focusSearchInput;

        this.$onInit = function () {
            _initalizeByStateParams($state.params);
            $scope.$on('$stateChangeSuccess', function ($event, toState, toParams, fromState, fromParams) {
                //검색결과에서 메일 본문보기가 변경될 경우에는 검색목록 재요청하지 않음
                if (!_.isEqual(_.omit(toParams, 'mailId'), _.omit(fromParams, 'mailId'))) {
                    _initalizeByStateParams(toParams);
                }
            });
        };

        function tagModels(modelList) {
            return MailSearchFormRepository.tagModels(modelList);
        }

        function resetModels() {
            MailSearchFormRepository.clear();
            MailSearchResultRepository.clear();
        }

        function searchWithStateChange() {
            $state.go(MAIL_STATE_NAMES.SEARCH_BOX, MailSearchFormRepository.toUrlParamObject(), {
                reload: false,
                inherit: false
            });
        }

        function onChangeKeyword(keyword) {
            $ctrl.searchFieldList = MailSearchUtil.getSearchFieldList(keyword);
            DigestService.safeLocalDigest($scope);
        }

        function focusSearchInput() {
            $ctrl.searchInputFocus = true;
            $timeout(function () {
                $ctrl.searchInputFocus = false;
            }, 100, false);
        }

        function _initalizeByStateParams(toParams) {
            if ($state.includes(MAIL_STATE_NAMES.SEARCH_BOX)) {
                focusSearchInput();
                var tagModels = MailSearchUtil.createTagModelsFromQueryString(toParams.query);
                if (!_.isEmpty(tagModels)) {
                    MailSearchFormRepository.tagModels(MailSearchUtil.createTagModelsFromQueryString(toParams.query));
                    MailSearchFormRepository.page(toParams.page);
                    MailSearchResultRepository.fetchAndCache(MailSearchFormRepository.toQueryObject());
                    return;
                }
            }
            MailSearchFormRepository.clear();
            MailSearchResultRepository.clear();
        }
    }

})
();
