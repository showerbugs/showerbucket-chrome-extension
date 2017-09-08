(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('postLinkInView', {
            /* @ngInject */
            templateUrl: function ($attrs) {
                return $attrs.getViewStateName ? 'modules/project/view/component/postLinkInView/postLinkInView.html' :
                    'modules/project/view/component/postLinkInView/postLinkInView.draft.html';
            },
            controller: PostLinkInView,
            bindings: {
                post: '<',
                fetchedAt: '<',
                getViewStateName: '&'
            }
        });

    /* @ngInject */
    function PostLinkInView(_) {
        var self = this;
        this.uiVersion = 1;

        this.$onChanges = function (changes) {
            if (_.result(changes, 'post.isFirstChange') || _.isEmpty(self.post)) {
                return;
            }
            self.uiVersion += 1;
        };
    }

})();
