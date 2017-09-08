(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .filter('groupContentPostList', GroupContentPostList);

    /* @ngInject */
    function GroupContentPostList(_) {
        return function (result) {
            var posts = [],
                lastPost = null,
                postMap = result.refMap.postMap,
                itemList = result.contents();

            _.forEach(itemList, function (item) {
                if (item.type === 'post') {
                    if (_.get(lastPost, 'id') === item.id) {
                        var popedPost = posts.pop();
                        item._getOrSetProp('events', popedPost._props.events);
                        item._getOrSetProp('files', popedPost._props.files);
                    }

                    posts.push(item);
                    lastPost = item;
                    return;
                }

                if (_.get(lastPost, 'id') === item.postId) {
                    _pushOrSetItem(lastPost, item.type === 'event' || item.type === 'comment' ? 'events' : 'files', item);
                    return;
                }

                // refrence를 이용하지 못해서 깊은 복사 사용(중복데이터가 들어올 수 있음)
                lastPost = _.cloneDeep(postMap(item.postId));
                //lastPost._props = _.cloneDeep(postMap(item.postId)._props)
                _.set(lastPost, '_props.events', item.type === 'event' || item.type === 'comment' ? [item] : []);
                _.set(lastPost, '_props.files', item.type === 'file' ? [item] : []);
                posts.push(lastPost);
            });

            return posts;
        };

        function _pushOrSetItem(lastPost, propName, item) {
            var targetPath = '_props.' + propName;
            if (_.get(lastPost, targetPath)) {
                _.get(lastPost, targetPath).push(item);
            } else {
                _.set(lastPost, targetPath, [item]);
            }
        }
    }

})();
