(function () {

    'use strict';

    angular
        .module('doorayWebApp.stream')
        .factory('StreamListBiz', StreamListBiz);

    /* @ngInject */
    function StreamListBiz(STREAM_ITEM_TYPE, DateConvertUtil, ResponseWrapAppendHelper, StreamListResource, _) {
        var nextTimestamp = null;

        return {
            fetchList: function (params, isFirst) {
                if (!isFirst) {
                    params.before = nextTimestamp;
                }

                var resource = StreamListResource.get(params);
                return {
                    resource: resource,
                    $promise: resource.$promise.then(function (result) {
                            if (!result.references()) {
                                return result;
                            }
                            nextTimestamp = result.references().nextTimestamp;

                            _.forEach(result.contents(), function (item) {
                                //TODO 목데이터
                                item.type = item.type === 'event' || item.type === 'post_event' ? 'post' : item.type;
                                item._resetFetchedAt = function () {
                                    item._getOrSetProp('fetchedAt', DateConvertUtil.makeTimestamp());
                                };
                                item._resetFetchedAt();
                                applyResponseWrapAppendHelperToPost(item, result);
                                applyResponseWrapAppendHelperToMail(item, result);
                                applyResponseWrapAppendHelperToSchedule(item, result);
                            });
                            return result;
                        }
                    )
                };
            },
            setRead: function () {
                return StreamListResource.read();
            }
        };

        function applyResponseWrapAppendHelperToPost(item, result) {
            if (item.type === STREAM_ITEM_TYPE.POST && item.post) {
                ResponseWrapAppendHelper.create({
                    content: item._wrap.refMap.postMap(item.post.id),
                    references: result.references()
                });
            }
        }

        function applyResponseWrapAppendHelperToMail(item, result) {
            if (item.type === STREAM_ITEM_TYPE.MAIL) {
                ResponseWrapAppendHelper.create({
                    content: item._wrap.refMap.mailMap(item.mail.id),
                    references: result.references()
                });
            }
        }

        function applyResponseWrapAppendHelperToSchedule(item, result) {
            if (item.type === STREAM_ITEM_TYPE.SCHEDULE) {
                ResponseWrapAppendHelper.create({
                    content: item._wrap.refMap.scheduleMap(item.schedule.id),
                    references: result.references()
                });
            }
        }
    }

})
();
