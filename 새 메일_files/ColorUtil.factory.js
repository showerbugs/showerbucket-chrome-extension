(function () {

    'use strict';

    angular
        .module('doorayWebApp.common')
        .factory('ColorUtil', ColorUtil);

    /* @ngInject */
    function ColorUtil() {
        function getRgbaFromHexColor(hex, alpha) {
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function(m, r, g, b) {
                return r + r + g + g + b + b;
            });

            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? ['rgba(' + parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16),
                alpha + ')'].join(',') : '';
        }
        function makeTextColor(color) {
            var red, green, blue;
            color = _.parseInt(color.replace('#',''), 16);
            blue = color % 256;
            color /= 256;
            green = color % 256;
            red = color / 256;

            return (red + green + blue) / 3 < 130 ? 'white' : '#333';
        }

        return {
            getRgbaFromHexColor: getRgbaFromHexColor,
            makeTextColor: makeTextColor
        };
    }

})();
