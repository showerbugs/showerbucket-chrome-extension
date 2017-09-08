(function () {

    'use strict';

    angular
        .module('doorayWebApp.stream')
        .factory('CommonStreamUtil', CommonStreamUtil);

    /* @ngInject */
    function CommonStreamUtil(ITEM_TYPE, ResponseWrapAppendHelper, ScheduleDisplayHelperFactory, TaskDisplayHelperFactory) {
        var DisplayHelper = {};
        DisplayHelper[ITEM_TYPE.POST] = TaskDisplayHelperFactory;
        DisplayHelper[ITEM_TYPE.SCHEDULE] = ScheduleDisplayHelperFactory;
        return {
            applyEventDetail: applyEventDetail,
            applyCommentWrapper: applyCommentWrapper,
            makeIsReadFunc: makeIsReadFunc
        };

        function applyEventDetail(streamItem) {
            var organizationMemberMap = streamItem._wrap.refMap.organizationMemberMap(),
                fileMap = streamItem._wrap.refMap.fileMap(),
                transformedEventList = _.map(streamItem.eventList, function (event) {
                    var eventDetail = streamItem._wrap.refMap.eventMap(event.id);
                    // 메일원문보기 버튼을 계속 보이게 하기 위한 예외처리
                    eventDetail = _.get(eventDetail, 'creator.type') === 'emailUser' ? _.cloneDeep(eventDetail) : eventDetail;
                    var result = ResponseWrapAppendHelper.create({
                        content: eventDetail,
                        references: {organizationMemberMap: organizationMemberMap, fileMap: fileMap}
                    });
                    return result.contents();
                });

            return _makeEventGroup(_(transformedEventList).takeRight(transformedEventList.length > 5 ? transformedEventList.length - 1 : 5), streamItem.type);
        }

        function _makeEventGroup(lodashEventList, type) {
            lodashEventList
                .forEach(function (event) {
                    if (event.type === 'comment') {
                        applyCommentWrapper(event, type);
                    }
                });
            return lodashEventList.value();
        }

        function applyCommentWrapper(event, type) {
            new DisplayHelper[type].AssignDisplayPropertiesBuilder(event)
                .withShortContent(500)
                .build();
        }

        function makeIsReadFunc(streamItem) {
            return function (index) {
                return _.isNumber(index) ? (!streamItem.eventList[index] || streamItem.eventList[index].read) :
                streamItem[streamItem.type].read && _.get(_.last(streamItem.eventList), 'read', true);
            };
        }
    }

})();
