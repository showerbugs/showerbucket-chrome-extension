(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .service('CheckDuplicatedUtil', CheckDuplicatedUtil);

    /* @ngInject */
    function CheckDuplicatedUtil(_) {
        //[], function(item){ return true } or
        //[], 'id', '1234'
        this.byString = function (list, valueOrCallBack, compareValue) {
            if (_.isString(valueOrCallBack) && _.isUndefined(compareValue)) {
                return !!_.find(list, function (item) {
                    return _.isString(item) && item.toLowerCase() === valueOrCallBack.toLowerCase();
                });
            }

            return !!_.find(list, function (item) {
                return _.isFunction(valueOrCallBack) ? valueOrCallBack(item) :
                item[valueOrCallBack] && item[valueOrCallBack].toLowerCase() === compareValue.toLowerCase();
            });
        };

        this.byRawString = function (list, valueOrCallBack, compareValue) {
            if (_.isString(valueOrCallBack) && _.isUndefined(compareValue)) {
                return _.isArray(list) && list.indexOf(valueOrCallBack) > -1;
            }

            return !!_.find(list, function (item) {
                return _.isFunction(valueOrCallBack) ? valueOrCallBack(item) :
                item[valueOrCallBack] && item[valueOrCallBack] === compareValue;
            });
        };
    }
})();

