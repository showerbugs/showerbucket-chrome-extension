(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('MovingPostResource', MovingPostResource)
        .factory('MovingPost', MovingPost);

    /* @ngInject */
    function MovingPostResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/projects/:fromProjectCode/posts/:postNumber/move',
            {
                fromProjectCode: '@fromProjectCode',
                postNumber: '@postNumber'
            },
            {
                save: {method: 'POST', ignore: {isSuccessfulFalsy: true}},
                movePostList: {method: 'POST', url: ApiConfigUtil.wasContext() + '/projects/*/posts/move', ignore: {isSuccessfulFalsy: true}}
            });
    }

    /* @ngInject */
    function MovingPost(MovingPostResource) {
        var subPost = {
            changeParent: function (parentPost, childPost) {
                var childParam = {
                    fromProjectCode: childPost.projectCode,
                    postNumber: childPost.postNumber || childPost.number
                }, parentParam = {
                    projectCode: parentPost.projectCode,
                    parentPostNumber: parentPost.postNumber || parentPost.number
                };

                return MovingPostResource.save(childParam, parentParam);
            },
            changeToPost: function (post) {
                var param = {
                    fromProjectCode: post.projectCode,
                    postNumber: post.number
                }, settingParam = {
                    projectCode: post.projectCode,
                    parentPostNumber: null
                };

                return MovingPostResource.save(param, settingParam);
            }
        };

        return {
            changeParent: subPost.changeParent,
            changeToPost: subPost.changeToPost,
            movePostToProject: movePostToProject,
            moveMultiPostToProject: moveMultiPostToProject
        };

        function movePostToProject(fromPost, toProjectCode, option) {
            var fromParam = {
                fromProjectCode: fromPost.projectCode,
                postNumber: fromPost.number
            }, toParam = _makeMoveProjectToParam(toProjectCode, option);

            return MovingPostResource.save(fromParam, toParam);
        }

        function moveMultiPostToProject(fromPostIds, toProjectCode, option) {
            var param = _makeMoveProjectToParam(toProjectCode, option);
            param.postIdList = fromPostIds;
            return MovingPostResource.movePostList(param);
        }

        function _makeMoveProjectToParam(toProjectCode, option) {
            option = option || option;
            return {
                targetProjectCode: toProjectCode,
                includeSubPosts: option.includeSubPosts,
                tagMap: option.tagMap,
                milestoneMap: option.milestoneMap
            };
        }
    }

})();
