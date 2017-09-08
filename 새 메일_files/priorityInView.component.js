(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('priorityInView', {
            templateUrl: 'modules/project/view/component/priorityInView/priorityInView.html',
            controller: PriorityInView,
            bindings: {
                post: '<',
                fetchedAt: '<',
                showEditBtn: '<',
                editForm: '<'
            }
        });

    /* @ngInject */
    function PriorityInView(InlineEditFormBuilder, PriorityUtil, gettextCatalog, _) {
        var $ctrl = this;
        $ctrl.editMode = false;
        $ctrl.uiVersion = 1;

        this.$onChanges = function (changes) {
            if (_.isEmpty($ctrl.post)) {
                return;
            }
            _setValue();

            if (!_.result(changes, 'post.isFirstChange')) {
                recompile();
            }
        };

        this.$onDestroy = function () {
            $ctrl.editForm = null;
        };

        $ctrl.show = show;
        $ctrl.getPriorityLabel = getPriorityLabel;

        function show() {
            this.editForm.show(_makeEditFormInstance()).then(function () {
                $ctrl.editMode = true;
                recompile();
            });
        }

        function getPriorityLabel(priority) {
            if (!priority) {
                return;
            }
            if (priority === 'none') {
                return gettextCatalog.getString('우선순위');
            }
            return PriorityUtil.getLabel(priority);
        }

        function _setValue() {
            $ctrl.priority = $ctrl.post.priority || 'none';
        }

        function recompile() {
            $ctrl.uiVersion += 1;
        }

        function _makeEditFormInstance() {
            return new InlineEditFormBuilder('priority', gettextCatalog.getString('우선순위'))
                .withHasChanged(_hasChanged)
                .withCancel(_cancel)
                .withCreateSubmitData(_createSubmitData)
                .withFocus(recompile)
                .build();
        }

        function _hasChanged() {
            return $ctrl.priority !== $ctrl.post.priority;
        }

        function _cancel() {
            _setValue();
            $ctrl.editMode = false;
            recompile();
        }

        function _createSubmitData() {
            return {
                priority: $ctrl.priority,
                version: $ctrl.post.version
            };
        }

    }

})();
