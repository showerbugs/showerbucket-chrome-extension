(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .component('durationInView', {
            templateUrl: 'modules/components/view/durationInView/durationInView.html',
            controller: DurationInView,
            bindings: {
                item: '<',
                fetchedAt: '<',
                showEditBtn: '<',
                editForm: '<',
                dateFormat: '@',
                onClickEdit: '&'
            }
        });

    /* @ngInject */
    function DurationInView(InlineEditFormBuilder, MessageModalFactory, gettextCatalog, moment, _) {
        var self = this;
        this.editMode = false;
        this.uiVersion = 1;

        this.$onChanges = function (changes) {
            if (_.isEmpty(self.item)) {
                return;
            }
            _setValue();

            if (!_.result(changes, 'item.isFirstChange')) {
                recompile();
            }
        };

        this.$onDestroy = function () {
            self.editForm = null;
        };

        this.show = show;

        function _setValue() {
            self.dateFormat = self.dateFormat || 'YYYY.MM.DD HH:mm';
            self.startedAt = self.item.startedAt;
            self.endedAt = self.item.endedAt;
        }

        function recompile() {
            self.uiVersion += 1;
        }

        function show() {
            this.editForm.show(_makeEditFormInstance()).then(function () {
                self.editMode = true;
                recompile();
            });
        }

        function _makeEditFormInstance() {
            return new InlineEditFormBuilder('duration', gettextCatalog.getString('일정 범위'))
                .withHasChanged(_hasChanged)
                .withCancel(_cancel)
                .withCreateSubmitData(_createSubmitData)
                .withFocus(recompile)
                .build();
        }

        function _hasChanged() {
            return self.startedAt !== self.item.startedAt || self.endedAt !== self.item.endedAt;
        }

        function _cancel() {
            _setValue();
            self.editMode = false;
            recompile();
        }

        function _createSubmitData() {
            if (moment(self.startedAt).isAfter(self.endedAt)) {
                MessageModalFactory.alert(gettextCatalog.getString('시작일은 종료일 이전으로 입력해 주세요.'));
                return;
            }
            return {
                startedAt: self.startedAt,
                endedAt: self.endedAt
            };
        }
    }

})();
