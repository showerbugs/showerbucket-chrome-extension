(function () {

    'use strict';

    angular
        .module('doorayWebApp.stream')
        .component('doorayStreamPostItem', {
            controller: DoorayStreamPostItem,
            templateUrl: 'modules/stream/list/item/doorayStreamPostItem/doorayStreamPostItem.html',
            bindings: {
                streamItem: '<',
                editTarget: '<',
                viewPostContent: '&',
                toggleWriteform: '&'
            }
        });

    /* @ngInject */
    function DoorayStreamPostItem(ITEM_TYPE, STREAM_ITEM_TYPE, CommonStreamUtil, DateConvertUtil, HelperConfigUtil, ItemSyncService, TaskDisplayHelperFactory, TaskViewBiz, TaskWorkflowService, _) {
        var $ctrl = this;
        $ctrl.ITEM_TYPE = ITEM_TYPE;
        $ctrl.isRead = CommonStreamUtil.makeIsReadFunc($ctrl.streamItem);
        $ctrl.viewContent = viewContent;
        $ctrl.changeWorkflow = changeWorkflow;
        $ctrl.openCommentWriteform = openCommentWriteform;
        $ctrl.applyCommentWrapper = applyCommentWrapper;

        init();

        function viewContent(eventId, type) {
            $ctrl.viewPostContent({streamItem: $ctrl.streamItem, focusTarget: {eventId: eventId, type: type}});
        }

        function changeWorkflow(workflowId, memberId) {
            var params = {
                projectCode: $ctrl.post.projectCode,
                postNumber: $ctrl.post.number,
                target: memberId
            };
            TaskViewBiz.changeWorkflow(params, workflowId).then(function () {
                ItemSyncService.syncItemUsingRefresh($ctrl.post, ITEM_TYPE.POST);
            });
        }

        function openCommentWriteform(post) {
            var editTarget = {
                type: STREAM_ITEM_TYPE.POST,
                id: post.id
            };
            $ctrl.toggleWriteform({editTarget: editTarget});
        }

        function applyCommentWrapper(event) {
            CommonStreamUtil.applyCommentWrapper(event, ITEM_TYPE.POST);
        }

        function getActionAt(streamItem) {
            return _.isEmpty(streamItem.eventList) ?
                _.get(streamItem._wrap.refMap.postMap(streamItem.post.id), 'createdAt') :
                _.get(streamItem._wrap.refMap.eventMap(_.last(streamItem.eventList).id), 'createdAt');
        }

        function initPostData(streamItem) {
            $ctrl.post = streamItem._wrap.refMap.postMap(streamItem.post.id);
            $ctrl.eventList = CommonStreamUtil.applyEventDetail(streamItem);

            TaskDisplayHelperFactory.assignDisplayPropertiesInStream($ctrl.post, true);

            $ctrl.myNextWorkflow = TaskWorkflowService.getMyNextWorkflow($ctrl.post);
            $ctrl.myNextWorkflowActionLabel = TaskWorkflowService.convertWorkflowToActionLabel(_.get($ctrl.myNextWorkflow, 'class'));
        }

        function init() {
            var streamItem = $ctrl.streamItem;
            $ctrl.myMemberId = HelperConfigUtil.orgMemberId();

            initPostData(streamItem);
            streamItem._getOrSetProp('actionAt', DateConvertUtil.convertDateTimeInView(getActionAt(streamItem)));

        }
    }

})();
