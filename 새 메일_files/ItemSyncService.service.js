(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .service('ItemSyncService', ItemSyncService)
        .service('PostSyncService', PostSyncService)
        .service('ScheduleSyncService', ScheduleSyncService);

    /* @ngInject */
    function ItemSyncService($q, ITEM_TYPE, CommonItemList, DateConvertUtil, DetailInstanceFactory, HelperConfigUtil, PostSyncService, ScheduleSyncService, StreamItemList, _) {
        var serviceMap = {};
        serviceMap[ITEM_TYPE.POST] = PostSyncService;
        serviceMap[ITEM_TYPE.SCHEDULE] = ScheduleSyncService;

        return {
            // 아래 메소드를 사용할 시에는 references가 없을 수 있으니 확인해야합니다.
            syncItemUsingCallback: function (itemId, type, callback) {
                if (!itemId || !_.isFunction(callback)) {
                    return;
                }
                var fetchedAt = DateConvertUtil.makeTimestamp();
                // callback 실행
                _(getViewTarget(itemId, type)).map('data').forEach(function (item) {
                    callback(item);
                    item._getOrSetProp('fetchedAt', fetchedAt);
                });
                CommonItemList.applyFunction(itemId, callback);
                StreamItemList.applyFunction(itemId, type, callback);
            },
            syncViewUsingCallback: function (itemId, type, callback) {
                if (!itemId || !_.isFunction(callback)) {
                    return;
                }
                _.forEach(getViewTarget(itemId, type), callback);
            },
            syncItemUsingRefresh: function (item, type, usingRefreshItem) {
                if (_.isEmpty(item)) {
                    return $q.reject();
                }
                return serviceMap[type].syncItemUsingRefresh(item, getViewTarget(item.id, type), usingRefreshItem);
            },
            syncItemUsingViewItem: function (item, type) {
                if (_.isEmpty(item)) {
                    return;
                }
                serviceMap[type].syncItemUsingViewItem(item, getViewTarget(item.id, type));
            },
            syncCommentsUsingRefresh: function (item, type) {
                if (_.isEmpty(item) || !type) {
                    return $q.reject();
                }
                return serviceMap[type].syncCommentsUsingRefresh(item, getViewTarget(item.id, type)).then(function (comments) {
                    syncStreamComments(item.id, type, comments);
                    return comments;
                });
            },
            syncStreamComments: syncStreamComments
        };

        function pushItemInList(id, item, list) {
            if (_.isEmpty(item) || id !== _.get(item, 'data.id')) {
                return;
            }
            list.push(item);
        }

        function getViewTarget(id, type) {
            var viewTargets = [];

            pushItemInList(id, DetailInstanceFactory.getOrMakeSelectedItem(type), viewTargets);
            pushItemInList(id, DetailInstanceFactory.getOrMakeModalItem(type), viewTargets);
            pushItemInList(id, DetailInstanceFactory.getStreamItem(type), viewTargets);

            return viewTargets;
        }

        function syncStreamComments(itemId, type, comments) {
            var myOrgId = HelperConfigUtil.orgMemberId();
            if (_.isEmpty(comments)) {
                return;
            }

            StreamItemList.applyFunction(itemId, type, function (streamItem) {
                var newStreamComments = [];
                streamItem.eventList = streamItem.eventList || [];

                streamItem._wrap.editReferences('eventMap', function (eventMap) {
                    var firstComment = _.find(streamItem.eventList, function (event) {
                        return _.get(streamItem._wrap.refMap.eventMap(event.id), 'type') === 'comment';
                    });
                    _.forEachRight(comments, function (comment) {
                        if (comment.type === 'event') {
                            return;
                        }
                        var streamComment = _.findLast(streamItem.eventList, {id: comment.id});
                        if (!streamComment) {
                            newStreamComments.unshift({id: comment.id, read: myOrgId === _.get(comment.creator, 'member.organizationMemberId')});
                            eventMap[comment.id] = comment;
                        }

                        eventMap[comment.id] = comment;
                        if (!firstComment || (streamComment && streamComment.id === firstComment.id)) {
                            return false;
                        }
                    });
                    if (streamItem.eventList.length <= 5 && (streamItem.eventList.length + newStreamComments.length) > 5) {
                        streamItem.eventList.unshift(newStreamComments[0]);
                    }
                    streamItem.eventList.push.apply(streamItem.eventList, newStreamComments);
                });
                if (comments[0]._wrap.refMap.fileMap) {
                    streamItem._wrap.editReferences('fileMap', function (fileMap) {
                        _.assign(fileMap, comments[0]._wrap.refMap.fileMap());
                    });
                }
            }, {needStreamItem: true});
        }
    }

    /* @ngInject */
    function PostSyncService($q, ITEM_TYPE, CommonItemList, DetailInstanceFactory, HelperPromiseUtil, TaskDisplayHelperFactory, StreamItemList, TaskListBiz, _) {
        var fetchListResource = null,
            fetchViewResouce = null;

        return {
            syncItemUsingRefresh: function (item, viewTargets, usingRefreshItem) {
                //sync는 동시에 1번만 돌게 수정
                if (HelperPromiseUtil.isResourcePending(fetchListResource) || HelperPromiseUtil.isResourcePending(fetchViewResouce)) {
                    return $q.reject();
                }
                if (usingRefreshItem) {
                    return _.isEmpty(viewTargets) ? $q.when() : $q.all([syncListItem(item), syncViewUsingRefreshItem(viewTargets)]);
                }
                return syncListItem(item).then(function (result) {
                    var post = TaskDisplayHelperFactory.assignDisplayPropertiesInView(result.contents());
                    syncViewItem(post, viewTargets);
                });
            },
            syncItemUsingViewItem: function (item, viewTargets) {
                if (HelperPromiseUtil.isResourcePending(fetchListResource) || HelperPromiseUtil.isResourcePending(fetchViewResouce)) {
                    return;
                }
                syncViewItem(item, viewTargets);
                return syncListItem(item);
            },
            syncCommentsUsingRefresh: function (item, viewTargets) {
                if (_.isEmpty(viewTargets)) {
                    return $q.reject();
                }
                var selectedItem = DetailInstanceFactory.createDummyItem(ITEM_TYPE.POST);
                selectedItem.param.projectCode = item.projectCode;
                selectedItem.param.postNumber = item.number;

                return selectedItem.refreshComments().then(function () {
                    _.forEach(viewTargets, function (target) {
                        if (target.option.showCommentWithWorkLog) {
                            target.refreshComments();
                            return;
                        }
                        target.comments = _.clone(selectedItem.comments);
                        target.commentTotalCnt = selectedItem.commentTotalCnt;
                        target.hasBeforeHistory = selectedItem.hasBeforeHistory;
                        target.hasAfterHistory = selectedItem.hasAfterHistory;
                    });
                    return selectedItem.comments;
                });
            }
        };

        function syncViewUsingRefreshItem(viewTargets) {
            var selectedItem = DetailInstanceFactory.createDummyItem(ITEM_TYPE.POST);
            selectedItem.param.projectCode = viewTargets[0].param.projectCode;
            selectedItem.param.postNumber = viewTargets[0].param.postNumber;

            fetchViewResouce = selectedItem.refreshItem();
            return fetchViewResouce.then(function () {
                _.forEach(viewTargets, function (target) {
                    _.assign(target.param, selectedItem.param);
                    _.assign(target.data, selectedItem.data);
                    target.files = selectedItem.files;
                    target.subPosts = selectedItem.subPosts;
                    if (target.option.showCommentWithWorkLog) {
                        target.refreshComments();
                        return;
                    }
                    target.comments = _.cloneDeep(selectedItem.comments);
                    target.commentTotalCnt = selectedItem.commentTotalCnt;
                    target.hasBeforeHistory = selectedItem.hasBeforeHistory;
                    target.hasAfterHistory = selectedItem.hasAfterHistory;
                });
                return selectedItem;
            });
        }

        function syncListItem(item) {
            fetchListResource = TaskListBiz.fetchTaskInList({projectCode: item.projectCode, postNumber: item.number});

            return fetchListResource.$promise.then(function (result) {
                var post = result.contents();
                CommonItemList.replaceItem(post);
                StreamItemList.replaceItem(post, ITEM_TYPE.POST);
                return result;
            });
        }

        function syncViewItem(item, viewTargets) {
            _.forEach(viewTargets, function (target) {
                _.assign(target.data, item);
            });
        }
    }

    /* @ngInject */
    function ScheduleSyncService($q, ITEM_TYPE, CalendarScheduleApiBiz, DetailInstanceFactory, HelperPromiseUtil, ScheduleDisplayHelperFactory, StreamItemList, _) {
        var fetchResource = null;

        return {
            syncItemUsingRefresh: function (item, viewTargets, usingRefreshItem) {
                //sync는 동시에 1번만 돌게 수정
                HelperPromiseUtil.cancelResource(_.get(fetchResource, 'resource'));

                if (usingRefreshItem && !_.isEmpty(viewTargets)) {
                    return syncViewUsingRefreshItem(viewTargets);
                }

                return syncListItem(item).then(function (result) {
                    var schedule = ScheduleDisplayHelperFactory.assignDisplayPropertiesInView(result.contents());
                    syncViewItem(schedule, viewTargets);
                });
            },
            syncItemUsingViewItem: function (item, viewTargets) {
                //sync는 동시에 1번만 돌게 수정
                HelperPromiseUtil.cancelResource(_.get(fetchResource, 'resource'));
                syncViewItem(item, viewTargets);
                syncListItem(item);
            },
            syncCommentsUsingRefresh: function (item, viewTargets) {
                if (_.isEmpty(viewTargets)) {
                    return $q.reject();
                }
                var selectedItem = DetailInstanceFactory.createDummyItem(ITEM_TYPE.SCHEDULE);
                selectedItem.param = item.id;

                return selectedItem.refreshComments().then(function () {
                    _.forEach(viewTargets, function (target) {
                        target.comments = selectedItem.comments;
                        target.commentTotalCnt = selectedItem.commentTotalCnt;
                        target.hasBeforeHistory = selectedItem.hasBeforeHistory;
                        target.hasAfterHistory = selectedItem.hasAfterHistory;
                    });
                    return selectedItem.comments;
                });
            }
        };

        function syncViewUsingRefreshItem(viewTargets) {
            var selectedItem = viewTargets[0];
            fetchResource = selectedItem.refreshItem();

            return fetchResource.then(function () {
                _.forEach(viewTargets, function (target) {
                    _.assign(target.param, selectedItem.param);
                    _.assign(target.data, selectedItem.data);
                    target.comments = selectedItem.comments;
                    target.commentTotalCnt = selectedItem.commentTotalCnt;
                    target.hasBeforeHistory = selectedItem.hasBeforeHistory;
                    target.hasAfterHistory = selectedItem.hasAfterHistory;
                });
            });
        }

        function syncListItem(item) {
            fetchResource = CalendarScheduleApiBiz.fetch(item.id);

            return fetchResource.then(function (result) {
                var schedule = result.contents();
                StreamItemList.replaceItem(schedule, ITEM_TYPE.SCHEDULE);
                return result;
            });
        }

        function syncViewItem(item, viewTargets) {
            _.forEach(viewTargets, function (target) {
                _.assign(target.data, item);
            });
        }
    }

})();
