(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('dueDateInView', {
            templateUrl: 'modules/project/view/component/dueDateInView/dueDateInView.html',
            controller: DueDateInView,
            bindings: {
                post: '<',
                fetchedAt: '<',
                showEditBtn: '<',
                editForm: '<'
            }
        });

    /* @ngInject */
    function DueDateInView(DueDateService, InlineEditFormBuilder, gettextCatalog, _) {
        var self = this;
        this.editMode = false;
        this.uiVersion = 1;

        this.$onChanges = function (changes) {
            if (_.isEmpty(self.post)) {
                return;
            }
            _setValue();

            if (!_.result(changes, 'post.isFirstChange')) {
                recompile();
            }
        };

        this.$onDestroy = function () {
            self.$onChanges = angular.noop;
            self.editForm = null;
        };

        this.show = show;

        function _setValue() {
            self.dueDate = self.post.dueDate;
            self.dueDateFlag = self.post.dueDateFlag;
            self.dueDateDesc = DueDateService.convertReadableDueDate(self.dueDate);
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
            return new InlineEditFormBuilder('dueDate', gettextCatalog.getString('완료일'))
                .withHasChanged(_hasChanged)
                .withCancel(_cancel)
                .withCreateSubmitData(_createSubmitData)
                .withFocus(recompile)
                .build();
        }

        function _hasChanged() {
            return self.dueDate !== self.post.dueDate || self.dueDateFlag !== self.post.dueDateFlag;
        }

        function _cancel() {
            _setValue();
            self.editMode = false;
            recompile();
        }

        function _createSubmitData() {
            return {
                dueDate: self.dueDate,
                dueDateFlag: self.dueDateFlag
            };
        }
    }

})();
