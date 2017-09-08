(function () {

    'use strict';

    angular
        .module('doorayWebApp.stream')
        .component('streamList', {
            require: {
                streamWindow: '^streamWindow'
            },
            templateUrl: 'modules/stream/list/streamList/streamList.html',
            controller: StreamList
        });

    /* @ngInject */
    function StreamList($scope, API_PAGE_SIZE, DigestService, SettingModalFactory, StreamCountRepository, StreamItemList) {
        var $ctrl = this,
            APPEND_SIZE = 20;

        $ctrl.listOption = {
            mention: false,
            unread: false
        };
        $ctrl.showHasChangedList = false;
        $ctrl.streamList = [];
        $ctrl.loading = false;
        $ctrl.editTarget = null;
        $ctrl.StreamCountRepository = StreamCountRepository;

        $ctrl.reload = init;
        $ctrl.fetchNextList = fetchNextList;
        $ctrl.toggleListOption = toggleListOption;
        $ctrl.hasRemainItems = hasRemainItems;
        $ctrl.toggleWriteform = toggleWriteform;
        $ctrl.openStreamSetting = openStreamSetting;

        $ctrl.$onInit = init;

        function init() {
            $ctrl.showHasChangedList = false;
            $ctrl.streamWindow.resetViews();
            $ctrl.streamList = [];

            StreamItemList.init($ctrl.listOption).then(function () {
                $ctrl.streamList = StreamItemList.getItems();
                fetchNextList(APPEND_SIZE);
            });
        }

        function fetchNextList() {
            if ($ctrl.loading) {
                return;
            }
            $ctrl.loading = true;
            StreamItemList.fetchNextList(APPEND_SIZE).finally(function () {
                $ctrl.loading = false;
                DigestService.safeLocalDigest($scope);
            });
        }

        function toggleListOption(optionName) {
            if (optionName === 'mention') {
                $ctrl.listOption[optionName] = $ctrl.listOption[optionName] ? false : 'all';
            } else {
                $ctrl.listOption[optionName] = !$ctrl.listOption[optionName];
            }
            init();
        }

        function hasRemainItems() {
            return StreamItemList.getRemainCount() > API_PAGE_SIZE.STREAM || StreamItemList.hasRemainItems();
        }

        function toggleWriteform(editTarget) {
            $ctrl.editTarget = _.isEqual(editTarget, $ctrl.editTarget) ? null : editTarget;
        }

        function openStreamSetting() {
            SettingModalFactory.open('stream');
            $ctrl.streamWindow.closeModal();
        }
    }

})();
