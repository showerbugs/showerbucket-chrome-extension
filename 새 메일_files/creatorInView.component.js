(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .component('creatorInView', {
            templateUrl: 'modules/components/view/creatorInView/creatorInView.html',
            controller: CreatorInView,
            bindings: {
                from: '<',
                date: '<',
                draft: '@'
            }
        });

    /* @ngInject */
    function CreatorInView(DateConvertUtil) {
        var self = this;
        this.uiVersion = 0;
        this.$onChanges = function () {
            if (_.isEmpty(self.from)) {
                return;
            }
            this.uiVersion += 1;
        };

        this.convertDateTimeInView = function (date) {
            return DateConvertUtil.convertDateTimeInView(date);
        };
    }

})();
