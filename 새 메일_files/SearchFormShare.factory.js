(function () {

    'use strict';

    angular
        .module('doorayWebApp.layout')
        .factory('SearchFormShare', SearchFormShare);

    /* @ngInject */
    function SearchFormShare($location, $state, SearchParamConvertUtil, gettextCatalog) {
        var scopes = ['1', '2', '3'];
        return {
            searchFieldList: [
                {label: (gettextCatalog.getString("전체") + ':'), code: "all"}
            ],
            searchParam: {},
            searchResultModel: [],
            searchScope: "",

            doSearch: function () {
            },

            setSearchScope: function (scope) {
                if (_.includes(scopes, scope)) {
                    this.searchScope = scope;
                    return;
                }

                // 정상적인 scope가 안들어올 때의 문제 수정
                var param = _.clone($state.params);
                param.scope = null;
                $state.go('.', param, {reload: false, notify: false});
            },

            initialize: function (codeLabelMap) {
                var searchParam = $location.search();

                this.searchResultModel = SearchParamConvertUtil.toModel(searchParam.query, function (model) {
                    model.label = codeLabelMap[model.code];
                });

                this.setSearchScope(searchParam.scope);
            }
        };
    }

})();
