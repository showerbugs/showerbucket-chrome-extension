(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .filter('filterMultiple', FilterMultiple);

    /* @ngInject */
    function FilterMultiple(_) {
        //http://stackoverflow.com/questions/15868248/how-to-filter-multiple-values-or-operation-in-angularjs
        //x in array | filterMultiple:{key1: value1, key2:[value21, value22]}
        return function (items, filterDict, comparator) {
            if (!items) {
                return false;
            }

            comparator = _.isFunction(comparator) ? comparator : function (actual, expected) {
                return (actual ? actual + '' : '').toLocaleLowerCase().indexOf(expected.toLowerCase()) > -1;
            };

            function compareWrapper(actual, expectedValues) {
                expectedValues = (expectedValues instanceof Array) ? expectedValues : (expectedValues ? [expectedValues] : []);
                for (var idx in expectedValues) {
                    var expected = expectedValues[idx];
                    if (comparator(actual, expected)) {
                        return true;
                    }
                }
                return false;
            }

            return items.filter(function (item, index, array) {
                if (_.isPlainObject(filterDict)) {
                    for (var filterKey in filterDict) {
                        if (compareWrapper(_.get(item, filterKey), filterDict[filterKey])) {
                            return true;
                        }
                    }
                } else if (_.isFunction(filterDict)) {
                    return (filterDict(item, index, array));
                } else {
                    return compareWrapper(item, filterDict);
                }
                return false;
            });
        };
    }

})();
