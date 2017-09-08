(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('PostEventBiz', PostEventBiz);

    /* @ngInject */
    function PostEventBiz(API_PAGE_SIZE, LIST_CONTENT_MAX_LENGTH, PaginationInstanceFactory, PostListWithContentBiz, ResponseWrapAppendHelper, TaskDisplayHelperFactory, TaskEventResource, groupCommentsToTasksFilter, _) {
        return {
            // 댓글 모아보기 전용 API
            fetchList: function (params) {
                var resource = TaskEventResource.get(params);
                return {
                    resource: resource,
                    $promise: resource.$promise.then(function (result) {
                        PaginationInstanceFactory.getOrMakeCommonListPagination()
                            .init(API_PAGE_SIZE.POST, params.page + 1, result.totalCount());

                        _.forEach(result.contents(), function (comment) {
                            new TaskDisplayHelperFactory.AssignDisplayPropertiesBuilder(comment)
                                .withCreatedAtSimpleFormat(true)
                                .withShortContent({length: LIST_CONTENT_MAX_LENGTH})
                                .build();
                        });

                        var posts = groupCommentsToTasksFilter(result);
                        result = ResponseWrapAppendHelper.create({
                            contents: posts,
                            references: result.references()
                        });
                        _.forEach(posts, function (post) {
                            post._getOrSetProp('uniqId', PostListWithContentBiz.makeUniqKey(post));
                            new TaskDisplayHelperFactory.AssignDisplayPropertiesBuilder(post)
                                .withProjectCode()
                                .withCopyProps()
                                .withResetFetchedAt()
                                .build();
                        });

                        return result;
                    })
                };
            },

            /*params: {
             projectCode
             postNumber
             postId
             type
             files
             contents
             }*/
            save: function (params) {
                var pathParams = {
                    'projectCode': params.projectCode,
                    'postNumber': params.postNumber,
                    'eventId': params.eventId
                };

                delete params.projectCode;
                delete params.postNumber;
                delete params.eventId;

                return TaskEventResource.save(pathParams, [params]).$promise.then(function (result) {
                    return result.result()[0];
                });
            },

            /*params: {
             projectCode
             postNumber
             eventId
             }*/
            remove: function (params) {
                return TaskEventResource.remove(params).$promise;
            },
            update: function (params) {
                return TaskEventResource.update(params).$promise;
            }
        };
    }

})();
