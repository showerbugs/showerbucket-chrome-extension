(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .component('doorayCommentBody', {
            require: {
                list: '^doorayEventList'
            },
            templateUrl: 'modules/components/view/event/doorayCommentBody/doorayCommentBody.html',
            controller: DoorayCommentBody,
            bindings: {
                comment: '<',
                creatorId: '@',
                translation: '<'
            }
        });

    /* @ngInject */
    function DoorayCommentBody(USER_TYPE, CommentWriteformBuilder, ItemSyncService, MessageModalFactory, PostEventBiz, gettextCatalog, _) {
        var $ctrl = this;

        this.USER_TYPE = USER_TYPE;

        this.$onInit = function () {
            $ctrl.bodyTemplateUrl = ['modules/components/view/event/doorayCommentBody/doorayCommentBody.', $ctrl.list.isStreamMode ? 'stream' : $ctrl.comment.creator.type, '.html'].join('');
            $ctrl.contentVersion = 0;
        };

        $ctrl.deleteComment = deleteComment;
        $ctrl.showUpdateCommentEditor = showUpdateCommentEditor;
        $ctrl.onCheckCommentBody = onCheckCommentBody;
        $ctrl.completeContentLoad = completeContentLoad;
        $ctrl.canEditComment = canEditComment;
        $ctrl.canDeleteComment = canDeleteComment;

        function deleteComment(selectedItem, comment) {
            MessageModalFactory.confirm([
                '<div style="text-align: center"><p>', gettextCatalog.getString('댓글을 삭제하면 다시 복구할 수 없습니다.'), '</p>' +
                '<p>', gettextCatalog.getString('삭제하시겠습니까?'), '</p></div>'
            ].join('')).result.then(function () {
                    return new CommentWriteformBuilder.deleteDummyBuilder($ctrl.list.itemType, comment).withItem($ctrl.list.item);
                }).then(function (dummyInstance) {
                    dummyInstance.deleteComment().then(function () {
                        $ctrl.list.hideUpdateCommentEditor();
                        selectedItem.commentTotalCnt -= 1;
                    });
                });
        }

        function showUpdateCommentEditor(comment) {
            $ctrl.list.editTargetComment = _.cloneDeep(comment);
        }

        function onCheckCommentBody(content, targetEvent) {
            _onCheckPostCommentBody(content, targetEvent);
        }

        function completeContentLoad() {
            $ctrl.contentVersion += 1;
        }

        function _onCheckPostCommentBody(content, targetEvent) {
            var post = $ctrl.list.item;

            targetEvent.body.content = content;

            return PostEventBiz.update({
                projectCode: _.get(post, 'projectCode'),
                postNumber: post.number,
                eventId: targetEvent.id,
                type: 1,
                body: targetEvent.body
            }).finally(function () {
                ItemSyncService.syncCommentsUsingRefresh(post, $ctrl.list.itemType);
            });
        }

        function canEditComment() {
            return $ctrl.list.isActiveEdit && $ctrl.comment.createOrganizationMemberId === $ctrl.list.myMemberId;
        }

        function canDeleteComment() {
            return ($ctrl.list.isActiveEdit && $ctrl.comment.createOrganizationMemberId === $ctrl.list.myMemberId) ||
                (_isBot($ctrl.comment.createOrganizationMemberId) && $ctrl.list.canRemoveEmailOrBotComment);
        }

        function _isBot(memberId) {
            var orgMemberMap = _.get($ctrl.comment, '_wrap.refMap.organizationMemberMap', angular.noop);
            return orgMemberMap(memberId)? orgMemberMap(memberId).tenantMemberRole === 'bot': false;
        }
    }

})();
