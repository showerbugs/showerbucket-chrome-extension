(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('PostListWithContentBiz', PostListWithContentBiz);

    /* @ngInject */
    function PostListWithContentBiz(LIST_CONTENT_MAX_LENGTH, ApiPageSizeFactory, PaginationInstanceFactory, ResponseWrapAppendHelper, TaskDisplayHelperFactory, groupContentPostListFilter, _) {
        var resourceApi;
        return {
            makeUniqKey: makeUniqKey,
            setResourceApi: function (api) {
                resourceApi = api;
            },
            fetchList: function (params) {
                var resource = resourceApi(params);
                return {
                    resource: resource,
                    $promise: resource.$promise.then(function (result) {
                        PaginationInstanceFactory.getOrMakeCommonListPagination()
                            .init(ApiPageSizeFactory.getListApiSize(), params.page + 1, result.totalCount());

                        _.forEach(result.contents(), function (item) {
                            var detail = result.refMap[item.type + 'Map'](item[item.type + 'Id']),
                                type = item.type;
                            _.assign(item, detail);
                            // type을 덮어씌우는 문제 해결
                            item.type = type;

                            new TaskDisplayHelperFactory.AssignDisplayPropertiesBuilder(item)
                                .withCreatedAtSimpleFormat(true)
                                .withShortContent({length: LIST_CONTENT_MAX_LENGTH, propertyName: 'snippet'})
                                .build();
                        });

                        var posts = groupContentPostListFilter(result);
                        result = ResponseWrapAppendHelper.create({
                            contents: posts,
                            references: result.references()
                        });
                        _.forEach(posts, function (post) {
                            post._getOrSetProp('uniqId', makeUniqKey(post));
                            new TaskDisplayHelperFactory.AssignDisplayPropertiesBuilder(post)
                                .withProjectCode()
                                .withCopyProps()
                                .withResetFetchedAt()
                                .build();
                        });

                        return result;
                    })
                };
            }
        };

        function makeUniqKey(post) {
            return post.id + getFirstItemId(post, 'events') + getFirstItemId(post, 'files') + post.updatedAt;
        }

        function getFirstItemId(post, propName) {
            return propName + _.get(_(post._getOrSetProp(propName)).first(), 'id', '');
        }
    }

})();
