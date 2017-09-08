(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('milestoneInView', {
            templateUrl: 'modules/project/view/component/milestoneInView/milestoneInView.html',
            controller: MilestoneInView,
            bindings: {
                post: '<',
                fetchedAt: '<',
                showEditBtn: '<',
                editForm: '<'
            }
        });

    /* @ngInject */
    function MilestoneInView(ITEM_TYPE, InlineEditFormBuilder, ItemSyncService, MilestoneBiz, gettextCatalog, _) {
        var self = this;

        this.editMode = false;
        this.uiVersion = 1;
        this.allMilestones = [];
        this.filterRule = {status: 'open'};

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
        this.changeMilestonesFilterRule = changeMilestonesFilterRule;

        function _setValue() {
            self.milestoneId = self.post.milestoneId;
        }

        function recompile() {
            self.uiVersion += 1;
        }

        function show() {
            this.editForm.show(_makeEditFormInstance()).then(function () {
                self.openTabIndex = 0;
                self.allMilestones = [];
                self.editMode = true;
                MilestoneBiz.getMilestonesForDropdown(self.post.projectCode).then(function (result) {
                    self.allMilestones = result.contents();
                    recompile();
                });
            });
        }

        function changeMilestonesFilterRule(status) {
            self.filterRule = MilestoneBiz.getMilestoneTabFilterRule(status);
            self.openTabIndex = status === 'open' ? 0 : 1;
        }

        function _makeEditFormInstance() {
            return new InlineEditFormBuilder('milestone', gettextCatalog.getString('마일스톤'))
                .withHasChanged(_hasChanged)
                .withCancel(_cancel)
                .withSubmit(_submit)
                .withFocus(recompile)
                .build();
        }

        function _hasChanged() {
            return self.milestoneId !== self.post.milestoneId;
        }

        function _cancel() {
            _setValue();
            self.editMode = false;
            recompile();
        }

        function _submit() {
            if (!self.milestoneId) {
                return;
            }
            var params = {
                milestoneId: self.milestoneId !== 'none' ? self.milestoneId : null,
                postIdList: [self.post.id]
            };

            return MilestoneBiz.assignMilestone(self.post.projectCode, params).then(function () {
                ItemSyncService.syncItemUsingRefresh(self.post, ITEM_TYPE.POST);
                self.editForm.cancel();
            });

        }


    }

})();
