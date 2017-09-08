(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .filter('groupCommentsToTasks', GroupCommentsToTasks);

    /* @ngInject */
    function GroupCommentsToTasks(_) {
        return function (eventsObj) {
            var posts = [],
                postMap = eventsObj.references().postMap,
                events = eventsObj.contents();

            _.forEach(events, function (event) {
                var lastPost = _.last(posts);
                if (_.get(lastPost, 'id', null) === event.postId) {
                    lastPost._props.events.push(event);
                    return;
                }

                // refrence를 이용하기 위해 얇은 복사만 수행(성능 향상)
                var clonePost = _.clone(postMap[event.postId]);
                _.set(clonePost, '_props.events', [event]);
                posts.push(clonePost);
            });

            return posts;
        };
    }

})();
