(function () {

    'use strict';

    angular
        .module('doorayWebApp.stream')
        .component('doorayStreamNotificationItem', {
            templateUrl: 'modules/stream/list/item/doorayStreamNotificationItem/doorayStreamNotificationItem.html',
            controller: DoorayStreamNotificationItem,
            bindings: {
                streamItem: '<'
            }
        });

    /* @ngInject */
    function DoorayStreamNotificationItem($state, PROJECT_STATE_NAMES, DateConvertUtil, StreamMetaData) {
        var $ctrl = this;
        $ctrl.goState = goState;

        function goState(streamItem) {
            var actionType = _.get(streamItem.project, 'actionDetail.type', _.get(streamItem.project, 'action.type'));
            if (actionType === 'invited' || actionType === 'code_changed') {
                $state.go(PROJECT_STATE_NAMES.PROJECT_BOX, {projectCodeFilter: streamItem._wrap.refMap.projectMap(streamItem.project.id).code}, {reload: PROJECT_STATE_NAMES.PROJECT_BOX});
            }
        }

        function init() {
            var streamItem = $ctrl.streamItem;
            streamItem._getOrSetProp('info', StreamMetaData.project.info(streamItem));
            streamItem._getOrSetProp('actionAt', DateConvertUtil.convertDateTimeInView(streamItem.project.at));
            streamItem._getOrSetProp('prefixContent', StreamMetaData.project.prefixContent(streamItem));
            streamItem._getOrSetProp('postfixContent', StreamMetaData.project.postfixContent(streamItem));
        }

        init();
    }

})();
