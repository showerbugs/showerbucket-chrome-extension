(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .service('CommentService', CommentService);

    /* @ngInject */
    function CommentService() {
        function removeBetweenBtnProperty(commentHasBtn) {
            delete commentHasBtn._getOrSetProp('metaData', null);
            delete commentHasBtn._getOrSetProp('isBetweenBtn', false);
        }

        function assignBetweenBtnProperty(comment, beforeCommentId) {
            comment._getOrSetProp('metaData', {
                beforeCommentId: beforeCommentId,
                afterCommentId: comment.id
            });
            comment._getOrSetProp('isBetweenBtn', true);
        }

        return {
            removeBetweenBtnProperty: removeBetweenBtnProperty,
            assignBetweenBtnProperty: assignBetweenBtnProperty
        };
    }

})();
