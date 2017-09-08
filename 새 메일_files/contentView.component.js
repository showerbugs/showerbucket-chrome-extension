(function () {

    'use strict';

    angular
        .module('doorayWebApp.render')
        .component('contentView', {
            templateUrl: 'modules/render/contentView/contentView.html',
            controller: ContentView,
            bindings: {
                body: '<',
                isDisabled: '<',
                onChecked: '&',
                onLoadComplete: '&'
            }
        });

    /* @ngInject */
    function ContentView( MIME_TYPE_REVERSE) {
        var $ctrl = this;

        //pass
        $ctrl.onMarkdownChecked = function (content, target) {
            $ctrl.onChecked({content: content, target: target});
        };

        this.$onChanges = function (changes) {
            if (changes.body && changes.body.currentValue) {
                $ctrl.contentType = MIME_TYPE_REVERSE[changes.body.currentValue.mimeType];
            }
        };

        this.$onDestroy = function () {
        };

        $ctrl.onLoad = function (target) {
            //console.log('contentView.onLoad', target);
            $ctrl.onLoadComplete({target: target});
        };

    }

})();
