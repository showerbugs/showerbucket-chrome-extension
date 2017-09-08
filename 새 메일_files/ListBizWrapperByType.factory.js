(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('ListBizWrapperByType', ListBizWrapperByType);

    /* @ngInject */
    function ListBizWrapperByType(ITEM_TYPE, MailDraftResource, MarkMailReadBiz, MailResource, MailsBiz, MarkMailImportantBiz, MarkTaskReadBiz, StreamListBiz, MailSearchBiz, PostListWithContentBiz, TaskDraftResource, PostEventBiz, TaskResource, TaskListBiz, MarkTaskImportantBiz) {
        var selectedListBizWrapper = {},
            listBizWrappers = {};

        var ListBizWrapperInterface = angular.element.inherit({
            listBiz: {},                // item 리스트를 출력해주는 resource를 가지고 있는 비즈니스로직 팩토리
            markImportantBiz: {},       // 중요표시를 하는 resource를 가지고 있는 비즈니스로직 팩토리
            markReadBiz: {},            // 읽음 안읽음을 표시하는 resource를 가지고 있는 비즈니스로직 팩토리
            itemResource: {},           // 업무를 위한 리소스
            draftResource: {},          // 임시보관 업무를 위한 리소스
            type: ''                   // 현재 자신의 type
        });

        var PostListBizWrapper = angular.element.inherit(ListBizWrapperInterface, {
            listBiz: TaskListBiz,
            markImportantBiz: MarkTaskImportantBiz,
            markReadBiz: MarkTaskReadBiz,
            itemResource: TaskResource,
            draftResource: TaskDraftResource,
            type: ITEM_TYPE.POST
        });
        listBizWrappers.post = new PostListBizWrapper();

        var MailListBizWrapper = angular.element.inherit(ListBizWrapperInterface, {
            listBiz: MailsBiz,
            markImportantBiz: MarkMailImportantBiz,
            markReadBiz: MarkMailReadBiz,
            itemResource: MailResource,
            draftResource: MailDraftResource,
            type: ITEM_TYPE.MAIL
        });
        listBizWrappers.mail = new MailListBizWrapper();

        var StreamListBizWrapper = angular.element.inherit(ListBizWrapperInterface, {
            listBiz: StreamListBiz
        });
        listBizWrappers.stream = new StreamListBizWrapper();

        var CalendarListBizWrapper = angular.element.inherit(ListBizWrapperInterface, {
            listBiz: TaskListBiz
        });
        listBizWrappers.calendar = new CalendarListBizWrapper();

        var MailSearchListBizWrapper = angular.element.inherit(MailListBizWrapper, {
            listBiz: MailSearchBiz
        });
        listBizWrappers.mailSearch = new MailSearchListBizWrapper();

        var TaskListInCommentBoxBizWrapper = angular.element.inherit(PostListBizWrapper, {
            listBiz: PostEventBiz
        });
        listBizWrappers.comment = new TaskListInCommentBoxBizWrapper();

        //var PostListInMentionBoxBizWrapper = angular.element.inherit(PostListBizWrapper, {
        //    listBiz: MentionListBiz
        //});
        //listBizWrappers.mention = new PostListInMentionBoxBizWrapper();
        ////
        ////var PostListInSearchBoxBizWrapper = angular.element.inherit(PostListBizWrapper, {
        ////    listBiz: PostSearchBiz
        ////});
        ////listBizWrappers.search = new PostListInSearchBoxBizWrapper();

        var PostListWithContentBizWrapper = angular.element.inherit(PostListBizWrapper, {
            listBiz: PostListWithContentBiz
        });
        listBizWrappers.postWithContent = new PostListWithContentBizWrapper();

        selectedListBizWrapper = new ListBizWrapperInterface();

        return {
            //getSelectedAttribute
            getSelectedBizWrapper: function () {
                return selectedListBizWrapper;
            },
            // selectItem
            selectBizWrapper: function (itemType) {
                selectedListBizWrapper = listBizWrappers[itemType];
                return selectedListBizWrapper;
            },
            getBizWrapper: function (type) {
                return listBizWrappers[type];
            }
        };
    }

})();
