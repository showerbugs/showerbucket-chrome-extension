(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('SearchParamConvertUtil', SearchParamConvertUtil);

    /* @ngInject */
    function SearchParamConvertUtil(_) {
        var SEPARATOR = {
            ENTITY: '&',
            ASSIGN: '='
        }, index = 0;

        function convertStringTo(string, callback) {
            return _.map(string.split(SEPARATOR.ENTITY), function (parsedStr) {
                var value = parsedStr.split(SEPARATOR.ASSIGN);
                return callback(value[0], value[1]);
            });
        }

        return {
            SEPARATOR: SEPARATOR,
            toModel: function (string, callback) {
                if (!string) {
                    return;
                }
                callback = callback || angular.noop;

                return convertStringTo(string, function (key, value) {
                        var model = {
                            code: key,
                            keyword: value,
                            id: index++
                        };
                    return callback(model) || model;
                });
            },
            toParam: function (string) {
                string = string || '';
                var param = {};
                convertStringTo(string, function (key, value) {
                    if (key === 'projectCode') {
                        param[key] = value;
                        return;
                    }

                    if (param[key]) {
                        param[key].push(value);
                        return;
                    }
                    param[key] = [value];
                });
                return param;
            },
            toString: function (models) {
                return _(models).map(function (model) {
                    return model.code + SEPARATOR.ASSIGN + model.keyword;
                }).join(SEPARATOR.ENTITY);
            }
        };
    }

})();
