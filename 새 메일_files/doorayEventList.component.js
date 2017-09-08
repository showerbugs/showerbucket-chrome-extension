(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .component('doorayEventList', {
            controller: DoorayEventList,
            /* @ngInject */
            templateUrl: function ($attrs) {
                return $attrs.templateUrl || 'modules/components/view/event/doorayEventList/doorayEventList.html';
            },
            bindings: {
                item: '<',
                translation:'<',
                selectedItem: '<?',
                eventList: '<',
                isSimpleViewMode: '<?',
                focusEditor: '&onFocusEditor',
                viewContent: '&',
                isRead: '&',
                itemType: '@',
                mode: '@'
            }
        });

    /* @ngInject */
    function DoorayEventList($element, $timeout, $uiViewScroll, ITEM_TYPE, HelperConfigUtil, PermissionFactory, PROJECT_API_PARAM_NAMES, _) {
        var self = this,
            MODE = {
                MEETING: 'meeting',
                STREAM: 'stream'
            };
        this.isMeetingMode = this.mode === MODE.MEETING;
        this.isStreamMode = this.mode === MODE.STREAM;
        this.ITEM_TYPE = ITEM_TYPE;

        self.editTargetComment = null;
        self.showCommentWithWorkLog = false;
        self.myMemberId = HelperConfigUtil.orgMemberId();

        self.isEditModeComment = isEditModeComment;
        self.hideUpdateCommentEditor = hideUpdateCommentEditor;
        self.loadBeforeComments = loadBeforeComments;
        self.loadAfterComments = loadAfterComments;
        self.onToggleShowCommentWithWorkLog = onToggleShowCommentWithWorkLog;
        self.onFocusEditor = onFocusEditor;
        self.scrollToBottom = scrollToBottom;
        self.isReadStream = isReadStream;
        self.viewStreamContent = viewStreamContent;
        self.isActiveEdit = isActiveEdit;

        this.$onChanges = function (changes) {
            if (changes.item && _.get(self.item, 'id')) {
                self.editTargetComment = null;
                self.canRemoveEmailComment = false;
                self.showCommentWithWorkLog = _.get(self.selectedItem, 'option.showCommentWithWorkLog');
                PermissionFactory.canRemoveEmailOrBotComment(self.item, self.itemType).then(function () {
                    self.canRemoveEmailOrBotComment = true;
                });
            }
        };

        function hideUpdateCommentEditor() {
            self.editTargetComment = null;
        }

        function isEditModeComment(comment) {
            return comment.id === _.get(self.editTargetComment, 'id');
        }

        function loadBeforeComments(size) {
            self.selectedItem.loadBeforeComments(size);
        }

        function loadAfterComments(size) {
            self.selectedItem.loadAfterComments(size);
        }

        function onToggleShowCommentWithWorkLog() {
            self.selectedItem.setOption({showCommentWithWorkLog: self.showCommentWithWorkLog});
            self.selectedItem.refreshComments();
        }

        function onFocusEditor() {
            return self.focusEditor();
        }

        function scrollToBottom() {
            $timeout(function () {
                $uiViewScroll($element.find('#bottomComment'));
            }, 500, false);
        }

        function isReadStream(index) {
            return self.isRead({index: index});
        }

        function viewStreamContent(eventId, eventType) {
            self.viewContent({eventId: eventId, eventType: eventType});
        }

        function isActiveEdit() {
            var result = true;
            if (self.itemType === ITEM_TYPE.POST && !_.isEmpty(self.item)) {
                result = _.get(self.item._wrap.refMap.projectMap(self.item.projectId), 'state') === PROJECT_API_PARAM_NAMES.STATE.ACTIVE && !self.isMeetingMode;
            }
            return result && !self.isStreamMode;
        }

        // TODO 추후 사용을 대비한 코드
        //self.loadBetweenComments = loadBetweenComments;

        //
        //function loadBetweenComments(comment) {
        //    self.selectedItem.loadBetweenComments(comment);
        //}
    }

})();
