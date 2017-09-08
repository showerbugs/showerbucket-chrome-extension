(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('movePostsTagOption', {
            templateUrl: 'modules/project/modals/MovePostsModal/movePostsTagOption/movePostsTagOption.html',
            controller: MovePostsTagOption,
            bindings: {
                projectCode: '<',
                tagMapList: '<',
                fromTagDetail: '<'
            }
        });

    /* @ngInject */
    function MovePostsTagOption(TagBiz, _) {
        var $ctrl = this;

        $ctrl.tagListMap = {};

        this.onSelectTag = onSelectTag;

        this.$onChanges = function () {
            if ($ctrl.projectCode) {
                _initToTagList();
            }
        };

        function onSelectTag(selectTag, tagDetail) {
            var isSelectOne = selectTag.tagPrefixId && _.get(selectTag._wrap.refMap.tagPrefixMap(selectTag.tagPrefixId), 'selectOne');

            _.forEach(TagBiz.filterSelectOneTagList(selectTag, tagDetail.list, isSelectOne), function (tagId) {
                _.remove(tagDetail.selected, {id: tagId});
            });
            TagBiz.applyIcon(selectTag, tagDetail.list);
            tagDetail.target.to = _.map(tagDetail.selected, 'id');
        }

        function _initToTagList() {
            $ctrl.tagListMap = {};
            TagBiz.getTags($ctrl.projectCode).then(function (result) {
                _.forEach($ctrl.tagMapList, function (tagDetail) {
                    $ctrl.tagListMap[tagDetail.from] = {
                        list: TagBiz.applyTagGroup(tagDetail.to, _.cloneDeep(result)),
                        selected: [],
                        target: tagDetail
                    };
                });
            });
        }

    }

})();
