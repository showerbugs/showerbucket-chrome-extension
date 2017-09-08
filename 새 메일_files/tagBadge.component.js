(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TagColorUtil', TagColorUtil)
        .component('tagBadge', {
            templateUrl: 'modules/project/components/tagBadge/tagBadge.html',
            controller: TagBadge,
            bindings: {
                onClick: '&?',
                tag: '<'
            }
        });

    /* @ngInject */
    function TagBadge(TagColorUtil) {
        var $ctrl = this;

        //PreDefined Callback;

        this.$onInit = function () {
            $ctrl.tagStyle = {
                'background-color': TagColorUtil.getBgColor('#' + $ctrl.tag.color),
                'color': TagColorUtil.getTextColor('#' + $ctrl.tag.color),
                'border-color': TagColorUtil.getBorderColor('#' + $ctrl.tag.color)
            };
        };

        this.$onChanges = function () {
        };

        this.$onDestroy = function () {
        };

        //TODO IMPLEMENTS

    }

    function TagColorUtil(TAG_COLOR_SET, ColorUtil, _) {
        //[tag color(border), text color, bg color]
        return {
            getColors: function() {
                return _.map(TAG_COLOR_SET, '[0]');
            },
            getBgColor: function(color) {
                return _.result(_.find(TAG_COLOR_SET, function(colorSet){
                    return colorSet[0] === color;
                }), '[2]', color);
            },
            getTextColor: function(color) {
                return _.result(_.find(TAG_COLOR_SET, function(colorSet){
                    return colorSet[0] === color;
                }), '[1]', ColorUtil.makeTextColor(color));
            },
            getBorderColor: function(color){
                return color;
            }
        };

    }

})();
