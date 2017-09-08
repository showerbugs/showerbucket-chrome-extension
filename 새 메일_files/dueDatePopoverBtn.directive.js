(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('dueDatePopoverBtn', {
            templateUrl: 'modules/project/components/dueDatePopoverBtn/dueDatePopoverBtn.html',
            controller: DueDatePopoverBtn,
            bindings: {
                post: '<'
            }
        });

    /* @ngInject */
    function DueDatePopoverBtn($element, ITEM_TYPE, DueDateService, MessageModalFactory, ItemSyncService, TaskViewBiz, gettextCatalog, _) {
        var self = this,
            streamModalContent$ = $element.parents('.modal-dialog');
        self.form = {};
        self.ui = {};
        self.isOpen = false;

        self.close = closeModal;
        self.submit = submit;

        streamModalContent$.on('click', _onClickModal);

        self.$onChanges = function () {
            if (self.post) {
                init();
            }
        };

        self.$onDestroy = function () {
            streamModalContent$.off('click');
        };

        function _onClickModal(event) {
            if (self.isOpen && _.isEmpty(angular.element(event.target).parents('.popover,.uib-datepicker-popup'))) {
                self.isOpen = false;
            }
        }

        function closeModal() {
            self.isOpen = false;
            init();
        }

        function _isInvalidForm() {
            if (self.form.startedAt && self.form.endedAt && moment(self.form.startedAt).isAfter(moment(self.form.endedAt))) {
                MessageModalFactory.alert(gettextCatalog.getString('시작일은 종료일 이전으로 입력해 주세요.'));
                return true;
            }
        }

        function submit() {
            var projectCode = _.get(self.post, 'projectCode'),
                postNumber = _.get(self.post, 'number');

            if (_isInvalidForm()) {
                return;
            }

            TaskViewBiz.update(projectCode, postNumber, self.form).then(function () {
                ItemSyncService.syncItemUsingRefresh(self.post, ITEM_TYPE.POST);
                closeModal();
            });
        }

        // 변경관리 프로젝트일 때 초기화
        function _initInManageChange() {
            self.ui.mode = 'manageChange';
            self.form.startedAt = self.post.startedAt;
            self.form.endedAt = self.post.endedAt;
        }

        // 기본 초기화
        function _initDefault() {
            self.ui.mode = 'default';
            self.ui.dueDateModeDesc = '';
            self.form.dueDate = self.post.dueDate;
            self.form.dueDateFlag = self.post.dueDateFlag;
        }

        function init() {
            self.post.projectCode === '(장애관리)변경관리' ? _initInManageChange() : _initDefault();
        }
    }

})();
