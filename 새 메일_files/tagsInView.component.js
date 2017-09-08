(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('tagsInView', {
            templateUrl: 'modules/project/view/component/tagsInView/tagsInView.html',
            controller: TagsInView,
            bindings: {
                post: '<',
                fetchedAt: '<',
                showEditBtn: '<',
                editForm: '<'
            }
        });

    /* @ngInject */
    function TagsInView(ITEM_TYPE, ArrayUtil, InlineEditFormBuilder, ItemSyncService, TagBiz, gettextCatalog, _) {
        var self = this;
        this.editMode = false;
        this.uiVersion = 1;
        this.selectedTags = [];
        this.allTags = [];

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
        this.selectTag = selectTag;

        function _setValue() {
            self.tagIdList = self.post.tagIdList;
        }

        function recompile() {
            self.uiVersion += 1;
        }

        function show() {
            self.editForm.show(_makeEditFormInstance()).then(function () {
                self.editMode = true;
                self.selectedTags = [];
                self.allTags = [];
                TagBiz.getTagsForMultiSelect(self.post.projectCode, self.post.tagIdList).then(function (allTags) {
                    self.selectedTags = [];
                    self.allTags = allTags;
                });
                recompile();
            });

        }
        function selectTag(selectTag) {
            var isSelectOne = selectTag.tagPrefixId && _.get(selectTag._wrap.refMap.tagPrefixMap(selectTag.tagPrefixId), 'selectOne');

            _.forEach(TagBiz.filterSelectOneTagList(selectTag, self.allTags, isSelectOne), function (tagId) {
                _.remove(self.tickedTags, {id: tagId});
            });

            if (!TagBiz.validate(self.selectedTags, selectTag, true)) {
                _.set(_.find(self.allTags, {'id': selectTag.id}), '_ticked', false);
                return;
            }

            TagBiz.applyIcon(selectTag, self.allTags);
        }

        function _makeEditFormInstance() {
            return new InlineEditFormBuilder('tags', gettextCatalog.getString('태그'))
                .withHasChanged(_hasChanged)
                .withCancel(_cancel)
                .withSubmit(_submit)
                .withFocus(recompile)
                .build();
        }

        function _hasChanged() {
            return !ArrayUtil.isEqualEntity(_.map(self.selectedTags, 'id'), self.post.tagIdList);
        }

        function _cancel() {
            _setValue();
            self.editMode = false;
            recompile();
        }

        function _submit() {
            var changedTags = _(self.selectedTags)
                .map('id')
                .xor(self.post.tagIdList)
                .map(function (id) {
                    return _.find(self.allTags, {id: id});
                }).value();

            if (_.isEmpty(changedTags)) {
                self.editForm.cancel();
                return;
            }

            TagBiz.assignTags(
                self.post.projectCode,
                [self.post.id],
                changedTags
            ).then(function () {
                    ItemSyncService.syncItemUsingRefresh(self.post, ITEM_TYPE.POST);
                    self.editForm.cancel();
                });
        }
    }

})();
