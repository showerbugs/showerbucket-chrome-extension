(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .filter('propsFilter', PropsFilter);

    /* @ngInject */
    function PropsFilter(_) {
        return function (items, props) {
            var out = [];

            if (!_.isArray(items)) {
                return items;
            }

            _.forEach(items, function (item) {
                var itemMatches = false;

                _.forEach(props, function (value, key) {
                    if (item[key] && item[key].toString().toLowerCase().indexOf(value) !== -1) {
                        itemMatches = true;
                        return false;
                    }
                });

                if (itemMatches) {
                    out.push(item);
                }
            });
            return out;
        };
    }

})();
