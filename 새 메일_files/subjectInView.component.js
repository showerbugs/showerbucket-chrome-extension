(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .component('subjectInView', {
            templateUrl: 'modules/components/view/subjectInView/subjectInView.html',
            controller: SubjectInView,
            bindings: {
                item: '<',
                fetchedAt: '<',
                translation: '<',
                showEditBtn: '<',
                editForm: '<',
                maxlength: '<'
            }
        });

    /* @ngInject */
    function SubjectInView(KEYS, InlineEditFormBuilder, MessageModalFactory, gettextCatalog, _) {
        var $ctrl = this,
            itemId = null,
            _originHtmlCache = null;
        this.editMode = false;
        this.uiVersion = 1;
        this.contentVersion = 1;

        this.$onChanges = function (changes) {
            if (_.isEmpty($ctrl.item)) {
                return;
            }
            _setValue();

            if ($ctrl.item && itemId !== $ctrl.item.id) {
                _originHtmlCache = null;
                itemId = $ctrl.item.id;
            }

            if (!_.result(changes, 'item.isFirstChange')) {
                recompile();
            }

            $ctrl.maxlength = $ctrl.maxlength || 300;
        };

        this.$onDestroy = function () {
            $ctrl.editForm = null;
        };

        this.onKeydown = onKeydown;
        this.show = show;

        function _setValue() {
            $ctrl.subject = $ctrl.item.subject;
        }

        function recompile() {
            $ctrl.uiVersion += 1;
        }

        function onKeydown(event) {
            switch (event.which) {
                case KEYS.ENTER:
                    $ctrl.editForm.submit();
                    event.preventDefault();
                    break;

                case KEYS.ESC:
                    $ctrl.editForm.cancelWithConfirm();
                    event.preventDefault();
                    break;
            }
        }

        function show() {
            this.editForm.show(_makeEditFormInstance()).then(function () {
                $ctrl.editMode = true;
                recompile();
            });
        }

        function _makeEditFormInstance() {
            return new InlineEditFormBuilder('subject', gettextCatalog.getString('제목'))
                .withHasChanged(_hasChanged)
                .withCancel(_cancel)
                .withCreateSubmitData(_createSubmitData)
                .withFocus(recompile)
                .build();
        }

        function _hasChanged() {
            return $ctrl.subject !== $ctrl.item.subject;
        }

        function _cancel() {
            _setValue();
            $ctrl.editMode = false;
            recompile();
        }

        function _createSubmitData() {
            if ($ctrl.subject) {
                return {
                    subject: $ctrl.subject
                };
            }

            MessageModalFactory.alert(gettextCatalog.getString('제목을 입력해 주세요.')).result.then(function () {
                recompile();
            });
        }
    }

})();
